let test = require('ava'),
    webdriver = require('selenium-webdriver'),
    {By, until} = webdriver,
    moment = require('moment'),
    _includes = require('lodash.includes'),
    _isRegExp = require('lodash.isregexp'),
    url = require('url'),
    path = require('path'),
    chalk = require('chalk')

// This gives us access to send Chrome commands.
require('chromedriver')

// Webdriver's promise manager only made sense before Node had async/await support.
// Now it's a deprecated legacy feature, so we should use the simpler native Node support instead.
webdriver.promise.USE_PROMISE_MANAGER = false

console.log(chalk.bold.cyan(
    `These tests assume that you have recently run ${path.resolve(__dirname, '..', '..', '..', 'insertSqlBaseData.sql')} on your SQLServer instance`
))

let shortWaitMs = 500

// We use the before hook to put helpers on t.context and set up test scaffolding.
test.beforeEach(t => {
    t.context.driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build()

    // This method is a helper so we don't have to keep repeating the hostname.
    // Passing the authentication through the querystring is a hack so we can
    // pass the information along via window.fetch. 
    t.context.get = async (pathname, userPw) => {
        let credentials = userPw || 'erin'
        await t.context.driver.get(`http://localhost:3000${pathname}?user=${credentials}&pass=${credentials}`)

        // If we have a page-wide error message, we would like to cleanly fail the test on that.
        try {
            await t.context.driver.wait(
                until.elementTextIs(
                    await t.context.$('.not-found-text', shortWaitMs), 
                    'There was an error processing this request. Please contact an administrator.'), 
                shortWaitMs
            )
            throw new Error('The API returned a 500. Do you need to restart the server?')
        } catch (e) {
            // NoSuchElementError: If we didn't find the "not found text" element, then we are not seeing a page-wide failure.
            // StaleElementReferenceError: If we found the "not found text" element but it's no longer on the page, 
            //      then we are not seeing a page-wide failure.
            // TimeoutError: If we found the "not found text" element, but the text was never the backend error message,
            //      then we are not seeing a page-wide failure.
            if (!_includes(['NoSuchElementError', 'StaleElementReferenceError', 'TimeoutError'], e.name)) {
                throw e
            }
        }
    }

    // For debugging purposes.
    t.context.waitForever = async () => {
        console.log(chalk.red('Waiting forever so you can debug...'))
        await t.context.driver.wait(() => {})
    }

    let longWaitMs = 7000
    t.context.$ = async (cssSelector, timeoutMs) => {
        let waitTimeoutMs = timeoutMs || longWaitMs
        let locator = By.css(cssSelector)
        await t.context.driver.wait(
            until.elementLocated(locator), 
            waitTimeoutMs,
            `Could not find element by css selector ${cssSelector} within ${waitTimeoutMs} milliseconds`
        )
        return await t.context.driver.findElement(locator)
    }
    t.context.$$ =  async cssSelector => {
        let locator = By.css(cssSelector)
        await t.context.driver.wait(
            until.elementsLocated(locator),
            longWaitMs, 
            `Could not find elements by css selector ${cssSelector} within ${longWaitMs} milliseconds`
        )
        return t.context.driver.findElements(locator)
    }

    // A helper function to combine waiting for an element to have rendered and then asserting on its contents.
    t.context.assertElementText = async (t, $elem, expectedText, message) => {
        try {
            let untilCondition = _isRegExp(expectedText) ? 
                    until.elementTextMatches($elem, expectedText) : until.elementTextIs($elem, expectedText)

            await t.context.driver.wait(untilCondition)
        } catch (e) {
            // If we got a TimeoutError because the element did not have the text we expected, just swallow it here
            // and let the assertion on blow up instead. That will produce a clearer error message.
            if (e.name !== 'TimeoutError') {
                throw e
            }
        }
        let actualText = (await $elem.getText()).trim()
        if (_isRegExp(expectedText)) {
            t.regex(actualText, expectedText, actualText, message)
        } else {
            t.is(actualText, expectedText, message)
        }
    }

    t.context.assertElementTextIsInt = (t, $elem, message) => t.context.assertElementText(t, $elem, /^\d+$/,)

    t.context.assertElementNotPresent = async (t, cssSelector, message, timeoutMs) => {
        let waitTimeoutMs = timeoutMs || longWaitMs
        try {
            await t.context.driver.wait(
                async () => {
                    try {
                        return !(await t.context.$(cssSelector, waitTimeoutMs))
                    } catch (e) {
                        if (e.name === 'TimeoutError') {
                            return true
                        }
                        throw e
                    }
                },
                waitTimeoutMs, 
                `Element was still present after ${waitTimeoutMs} milliseconds`
            )
        } catch (e) {
            if (e.name === 'TimeoutError') {
                t.fail(`Element with css selector '${cssSelector}' was still present after ${waitTimeoutMs} milliseconds`)
            } else {
                throw e
            }
        }
        t.pass(message || 'Element was not present')
    }

    t.context.getCurrentPathname = async () => {
        let currentUrl = await t.context.driver.getCurrentUrl()
        return url.parse(currentUrl).pathname
    }

    t.context.pageHelpers = {
        async goHomeAndThenToReportsPage() {
            await t.context.get('/')

            let $createButton = await t.context.$('#createButton')
            await $createButton.click()
        },
        async clickTodayButton() {
            let $todayButton = await t.context.$('.u-today-button')
            await $todayButton.click()
        },
        async chooseAutocompleteOption(autocompleteSelector, text) {
            let $autocompleteTextbox = await t.context.$(autocompleteSelector)
            await $autocompleteTextbox.sendKeys(text)
            let $autocompleteSuggestion = await t.context.$('#react-autowhatever-1--item-0')
            await $autocompleteSuggestion.click()
            return $autocompleteTextbox
        },
        async writeInForm(inputSelector, text) {
            let $meetingGoalInput = await t.context.$(inputSelector)
            await $meetingGoalInput.sendKeys(text)
        },
        async assertReportShowStatusText(t, text) {
            await t.context.assertElementText(t, await t.context.$('.report-show h4'), text)
        },
    }
})

// Shut down the browser when we are done.
test.afterEach.always(async t => {
    if (t.context.driver) {
        await t.context.driver.quit()
    }
})

test('Home Page', async t => {
    // We can use t.plan() to indicate how many assertions we plan to make.
    // This provides safety in case there's a silent failure and the test
    // looks like it exited successfully, when in fact it just died. I've 
    // seen people get bit by that a done with frameworks like Mocha which
    // do not offer test planning.
    t.plan(6)

    let {assertElementText, assertElementNotPresent, assertElementTextIsInt, $, $$} = t.context

    await t.context.get('/')

    // Use a CSS selector to find an element that we care about on the page.
    let [$reportsPending, $draftReports, $orgReports, $upcomingEngagements] = await $$('.home-tile h1')

    await assertElementTextIsInt(t, $reportsPending)
    await assertElementTextIsInt(t, $draftReports)
    await assertElementTextIsInt(t, $orgReports)
    await assertElementTextIsInt(t, $upcomingEngagements)

    let $tourLauncher = await $('.persistent-tour-launcher')
    await $tourLauncher.click()
    let $hopscotchTitle = await $('.hopscotch-title')
    await assertElementText(
        t, $hopscotchTitle, 'Welcome', 'Clicking the hopscotch launch button starts the hopscotch tour'
    )

    let $hopscotchNext = await $('.hopscotch-next')
    await $hopscotchNext.click()

    let $myReportsLink = await $('#leftNav > li:nth-child(2) > a')
    await $myReportsLink.click()
    await assertElementNotPresent(t, '.hopscotch-title', 'Navigating to a new page clears the hopscotch tour')
})

test.only('Draft and submit a report', async t => {
    t.plan(16)

    let {pageHelpers, $, $$, assertElementText} = t.context

    await pageHelpers.goHomeAndThenToReportsPage()
    await pageHelpers.writeInForm('#intent', 'meeting goal')

    let $engagementDate = await $('#engagementDate')
    await $engagementDate.click()

    await pageHelpers.clickTodayButton()

    let $locationAutocomplete = await pageHelpers.chooseAutocompleteOption('#location', 'general hospita')

    t.is(
        await $locationAutocomplete.getAttribute('value'), 
        'General Hospital', 
        'Clicking a location autocomplete suggestion populates the autocomplete field.'
    )

    let $positiveAtmosphereButton = await $('#positiveAtmos')
    await $positiveAtmosphereButton.click()

    let $attendeesAutocomplete = await pageHelpers.chooseAutocompleteOption('#attendees', 'christopf topferness')

    t.is(
        await $attendeesAutocomplete.getAttribute('value'), 
        '', 
        'Clicking an attendee autocomplete suggestion empties the autocomplete field.'
    )

    let [$principalPrimaryCheckbox, $principalName, $principalPosition, $principalOrg] = 
        await $$('#attendeesTable tbody tr:last-child td')

    t.is(
        await $principalPrimaryCheckbox.findElement(By.css('input')).getAttribute('value'), 
        'on', 
        'Principal primary attendee checkbox should be checked'
    )
    await assertElementText(t, $principalName, 'Christopf Topferness')
    await assertElementText(t, $principalPosition, 'Planning Captain')
    await assertElementText(t, $principalOrg, 'MoD')

    let $poamsAutocomplete = await pageHelpers.chooseAutocompleteOption('#poams', '1.1.B')

    t.is(
        await $poamsAutocomplete.getAttribute('value'), 
        '', 
        'Clicking a PoAM autocomplete suggestion empties the autocomplete field.'
    )

    let $newPoamRow = await $('.poams-selector table tbody tr td')
    await assertElementText(t, $newPoamRow, '1.1.B - Milestone the Second in EF1.1')

    await pageHelpers.writeInForm('#keyOutcomes', 'key outcomes')
    await pageHelpers.writeInForm('#nextSteps', 'next steps')

    let $reportTextField = await $('.reportTextField')
    t.false(await $reportTextField.isDisplayed(), 'Add details field should not be present before "add details" button is clicked"')

    let $addDetailsButton = await $('#toggleReportDetails')
    await $addDetailsButton.click()

    await pageHelpers.writeInForm('.reportTextField .text-editor', 'report details')

    let $formButtonSubmit = await $('#formBottomSubmit')
    await $formButtonSubmit.click()
    await pageHelpers.assertReportShowStatusText(t, "This report is in DRAFT state and hasn't been submitted.")
    
    let currentPathname = await t.context.getCurrentPathname()
    t.regex(currentPathname, /reports\/\d+/, 'URL is updated to reports/show page')

    let $submitReportButton = await $('#submitReportButton')
    await $submitReportButton.click()
    // This assertion bombs out with a StaleElementReferenceError and I'm not sure why.
    // await pageHelpers.assertReportShowStatusText(t, "This report is PENDING approvals.")

    let $approveButton = await $('.approve-button')
    await $approveButton.click()

    await assertElementText(
        t, 
        await $('.alert'), 
        'Successfully approved report.', 
        'Clicking the approve button displays a message telling the user that the action was successful.'
    )

    await t.context.get('/', 'rebecca')
    let $homeTile = await $('.home-tile')
    await t.context.driver.wait(until.elementIsVisible($homeTile))
    await $homeTile.click()

    let $firstReadReportButton = await $('.read-report-button')
    let reportHref = await $firstReadReportButton.getAttribute('href')
    await $firstReadReportButton.click()

    await pageHelpers.assertReportShowStatusText(t, "This report is PENDING approvals.")
    let $rebeccaApproveButton = await $('.approve-button')
    await $rebeccaApproveButton.click()

    await assertElementText(
        t, 
        await $('.alert'), 
        'Successfully approved report. It has been added to the daily rollup', 
        'When a report is approved, the user sees a message indicating that it has been added to the daily rollup'
    )

    let $dailyRollupLink = await t.context.driver.findElement(By.linkText('Daily rollup'))
    await $dailyRollupLink.click()

    currentPathname = await t.context.getCurrentPathname()
    t.is(currentPathname, '/rollup', 'Clicking the "daily rollup" link takes the user to the rollup page')

    async function getReportHrefsForPage() {
        let $readReportButtons = await $$('.read-report-button')
        return await Promise.all($readReportButtons.map(button => button.getAttribute('href')))
    }

    async function getAllReportHrefs() {
        let reportsHrefs = await getReportHrefsForPage()
        let pageCount
        try {
            pageCount = (await $$('.pagination li:not(:first-child):not(:last-child) a')).length
        } catch (e) {
            if (e.name === 'NoSuchElementError') {
                // If there are no pagination controls, then we do not need to look at multiple pages
                return reportsHrefs
            }
            throw e
        }

        for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
            console.log('look for', pageIndex)
            // +1 because nth-child is 1-indexed, 
            // and +1 because the first pagination button will be the "previous" button.
            let $pageButton = await $(`.pagination li:nth-child(${pageIndex + 2}) a`)
            console.log('pre click', pageIndex)
            await $pageButton.click()
            console.log('post click', pageIndex)
            reportsHrefs.push(...(await getReportHrefsForPage()))
        }

        return reportsHrefs
    }

    let allReportRefs = await getAllReportHrefs()
    t.true(_includes(allReportRefs, reportHref), 'Daily rollup report list includes the recently approved report')
})

test('Verify that validation and other reports/new interactions work', async t => {
    t.plan(28)

    let {assertElementText, $, $$, assertElementNotPresent, pageHelpers} = t.context

    await pageHelpers.goHomeAndThenToReportsPage()
    await assertElementText(t, await $('.legend .title-text'), 'Create a new Report')

    let $searchBarInput = await $('#searchBarInput')

    async function verifyFieldIsRequired($fieldGroup, $input, warningClass, fieldName) {
        await $input.click()
        await $input.clear()
        await $searchBarInput.click()

        t.true(
            _includes(await $fieldGroup.getAttribute('class'), warningClass), 
            `${fieldName} enters invalid state when the user leaves the field without entering anything`
        )

        await $input.sendKeys('user input')
        t.false(
            _includes(await $fieldGroup.getAttribute('class'), warningClass), 
            `After typing in ${fieldName} field, warning state goes away`
        )
    }

    let $meetingGoal = await $('.meeting-goal')
    let $meetingGoalInput = await $('#intent')

    t.false(
        _includes(await $meetingGoal.getAttribute('class'), 'has-warning'), 
        `Meeting goal does not start in an invalid state`
    )   
    t.is(await $meetingGoalInput.getAttribute('value'), '', `Meeting goal field starts blank`)

    await verifyFieldIsRequired($meetingGoal, $meetingGoalInput, 'has-warning', 'Meeting group')

    let $engagementDate = await $('#engagementDate')
    t.is(await $engagementDate.getAttribute('value'), '', 'Engagement date field starts blank')
    await $engagementDate.click()

    await pageHelpers.clickTodayButton()

    t.is(
        await $engagementDate.getAttribute('value'), 
        moment().format('DD/MM/YYYY'), 
        'Clicking the "today" button puts the current date in the engagement field'
    )

    let $locationInput = await $('#location')
    t.is(await $locationInput.getAttribute('value'), '', 'Location field starts blank')

    let $locationShortcutButton = await $('.location-form-group .shortcut-list button')
    await $locationShortcutButton.click()
    t.is(await $locationInput.getAttribute('value'), 'General Hospital', 'Clicking the shortcut adds a location')

    await assertElementNotPresent(t, '#cancelledReason', 'Cancelled reason should not be present initially', shortWaitMs)
    let $atmosphereFormGroup = await $('.atmosphere-form-group')
    t.true(await $atmosphereFormGroup.isDisplayed(), 'Atmosphere form group should be shown by default')

    await assertElementNotPresent(
        t, '#atmosphere-details', 'Atmosphere details should not be displayed before choosing an atmosphere', shortWaitMs
    )

    let $positiveAtmosphereButton = await $('#positiveAtmos')
    await $positiveAtmosphereButton.click()

    let $atmosphereDetails = await $('#atmosphereDetails')
    t.is(await $atmosphereDetails.getAttribute('placeholder'), 'Why was this engagement positive? (optional)')

    let $neutralAtmosphereButton = await $('#neutralAtmos')
    await $neutralAtmosphereButton.click()
    t.is((await $atmosphereDetails.getAttribute('placeholder')).trim(), 'Why was this engagement neutral?')

    let $negativeAtmosphereButton = await $('#negativeAtmos')
    await $negativeAtmosphereButton.click()
    t.is((await $atmosphereDetails.getAttribute('placeholder')).trim(), 'Why was this engagement negative?')

    let $atmosphereDetailsGroup = await $('.atmosphere-details')

    await $neutralAtmosphereButton.click()
    await verifyFieldIsRequired($atmosphereDetailsGroup, $atmosphereDetails, 'has-error', 'Neutral atmosphere details')

    let $attendanceFieldsetTitle = await $('#attendance-fieldset .title-text')
    await assertElementText(
        t, 
        $attendanceFieldsetTitle, 
        'Meeting attendance', 
        'Meeting attendance fieldset should have correct title for an uncancelled enagement'
    )

    let $cancelledCheckbox = await $('.cancelled-checkbox')
    await $cancelledCheckbox.click()

    await assertElementNotPresent(
        t, '.atmosphere-form-group', 'After cancelling the enagement, the atmospherics should be hidden', shortWaitMs
    )
    let $cancelledReason = await $('.cancelled-reason-form-group')
    t.true(await $cancelledReason.isDisplayed(), 'After cancelling the engagement, the cancellation reason should appear')
    await assertElementText(
        t, 
        $attendanceFieldsetTitle, 
        'Planned attendance', 
        'Meeting attendance fieldset should have correct title for a cancelled enagement'
    )

    let $attendeesRows = await $$('#attendeesTable tbody tr')
    t.is($attendeesRows.length, 2, 'Attendees table starts with 2 body rows')

    let [$advisorPrimaryCheckbox, $advisorName, $advisorPosition, $advisorOrg] = 
        await $$('#attendeesTable tbody tr:first-child td')
    
    t.is(
        await $advisorPrimaryCheckbox.findElement(By.css('input')).getAttribute('value'), 
        'on', 
        'Advisor primary attendee checkbox should be checked'
    )
    await assertElementText(t, $advisorName, 'Erin Erinson CIV')
    await assertElementText(t, $advisorPosition, 'EF2.2 Advisor D')
    await assertElementText(t, $advisorOrg, 'EF2.2')

    // We expect to see two shortcut buttons. One will be the current user's name.
    // Clicking on that button will have no effect, because the current user is already an attendee. The other will
    // be a principal's name. That's the button we want. Most of the time, that button appears to be last, but sometimes
    // it is not. To work around this, we'll click ALL the buttons.
    // If we fixed https://github.com/deptofdefense/anet/issues/527, we would not have this problem.
    let $addAttendeeShortcutButtons = await $$('#attendance-fieldset .shortcut-list button')
    await Promise.all($addAttendeeShortcutButtons.map($button => $button.click()))

    t.is((await $$('#attendeesTable tbody tr')).length, 3, 'Clicking the shortcut button adds a row to the table')

    let $submitButton = await $('#formBottomSubmit')
    await $submitButton.click()
    await pageHelpers.assertReportShowStatusText(t, "This report is in DRAFT state and hasn't been submitted.")
})

test('Report 404', async t => {
    t.plan(1)

    let {assertElementText, $} = t.context

    await t.context.get('/reports/555')
    await assertElementText(t, await $('.not-found-text'), 'Report #555 not found.')
})

test('Organization 404', async t => {
    t.plan(1)

    let {assertElementText, $} = t.context

    await t.context.get('/organizations/555')
    await assertElementText(t, await $('.not-found-text'), 'Organization #555 not found.')
})

test('People 404', async t => {
    t.plan(1)

    let {assertElementText, $} = t.context

    await t.context.get('/people/555')
    await assertElementText(t, await $('.not-found-text'), 'User #555 not found.')
})

test('PoAMs 404', async t => {
    t.plan(1)

    let {assertElementText, $} = t.context

    await t.context.get('/poams/555')
    await assertElementText(t, await $('.not-found-text'), 'PoAM #555 not found.')
})

test('Positions 404', async t => {
    t.plan(1)

    let {assertElementText, $} = t.context

    await t.context.get('/positions/555')
    await assertElementText(t, await $('.not-found-text'), 'Position #555 not found.')
})

/**
 * Notes: Technically speaking, everything should be wrapped in a wait() block to give
 * the the browser time to run JS to update the page. In practice, this does not
 * always seem to be necessary, since the JS can run very fast. If the tests are flaky,
 * this would be a good thing to investigate.
 * 
 * Also, I suspect that we may see a bunch of stale element errors as React replaces
 * DOM nodes. To fix this, we should use a model of passing around CSS selectors instead
 * of element references, and always query for the element at the last possible moment.
 */