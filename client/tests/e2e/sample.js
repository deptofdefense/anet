let test = require('ava'),
    webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    moment = require('moment'),
    _includes = require('lodash.includes'),
    chalk = require('chalk')

// This gives us access to send Chrome commands.
require('chromedriver')

// Webdriver's promise manager only made sense before Node had async/await support.
// Now it's a deprecated legacy feature, so we should use the simpler native Node support instead.
webdriver.promise.USE_PROMISE_MANAGER = false

console.log(
    chalk.bold.cyan('These tests assume that you have just run ../insertSqlBaseData.sql on your SQLServer instance')
)

// We use the before hook to put helpers on t.context and set up test scaffolding.
test.beforeEach(t => {
    t.context.driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build()

    // This method is a helper so we don't have to keep repeating the hostname.
    // Passing the authentication through the querystring is a hack so we can
    // pass the information along via window.fetch. 
    t.context.get = async pathname => {
        await t.context.driver.get(`http://localhost:3000${pathname}?user=erin&pass=erin`)
        let halfSecondMs = 500

        // If we have a page-wide error message, we would like to cleanly fail the test on that.
        let $notFound
        try {
            $notFound = await t.context.$('.not-found-text', halfSecondMs)
        } catch (e) {
            // If we couldn't find the error message element, then we don't need to fail the test.
            if (e.name === 'TimeoutError') {
                return
            }
            throw e
        }

        // If we have an error message, let's see if it's the backend 500 error.
        try {
            await t.context.waitUntilElementHasText(
                $notFound, 
                'There was an error processing this request. Please contact an administrator.', 
                halfSecondMs
            )
            throw new Error('The API returned a 500.')
        } catch (e) {
            if (e.name !== 'TimeoutError') {
                throw e
            }
        }
    }

    // For debugging purposes.
    t.context.waitForever = async () => {
        console.log(chalk.red('Waiting forever so you can debug...'))
        await t.context.driver.wait(() => {})
    }

    let fiveSecondsMs = 5000
    t.context.$ = async (cssSelector, timeoutMs) => {
        let waitTimeoutMs = timeoutMs || fiveSecondsMs
        let $foundElem
        await t.context.driver.wait(async () => {
                try {
                    $foundElem = await t.context.driver.findElement(By.css(cssSelector))
                    return true
                } catch (e) {
                    if (e.name === 'NoSuchElementError') {
                        return false
                    }
                    throw e
                }
            },
            waitTimeoutMs, 
            `Could not find element by css selector ${cssSelector} within ${waitTimeoutMs} milliseconds`
        )
        return $foundElem
    }
    t.context.$$ =  async cssSelector => {
        await t.context.driver.wait(async () => {
                try {
                    return t.context.driver.findElements(By.css(cssSelector))
                } catch (e) {
                    if (e.name === 'NoSuchElementError') {
                        return false
                    }
                    throw e
                }
            },
            fiveSecondsMs, 
            `Could not find elements by css selector ${cssSelector} within ${fiveSecondsMs} milliseconds`
        )
        return t.context.driver.findElements(By.css(cssSelector))
    }

    // This helper method is necessary because we don't know when React has finished rendering the page.
    // We will wait for it to be done, with a max timeout so the test does not hang if the rendering fails.
    t.context.waitUntilElementHasText = async ($elem, expectedText, timeoutMs) => {
        let waitTimeoutMs = timeoutMs || fiveSecondsMs
        await t.context.driver.wait(async () => {
            try {
                let text = await $elem.getText()
                return text === expectedText
            } catch (e) {
                // If $elem has been removed from the DOM since it was queried for,
                // we'll get a NoSuchElementError when trying to find its text.
                // If the element is not in the DOM, then it certainly does not
                // have the text we are looking for, so we'll return false.
                if (e.name === 'StaleElementReferenceError') {
                    return false
                }
                throw e
            }
        }, waitTimeoutMs, `Element did not have text '${expectedText}' within ${waitTimeoutMs} milliseconds`)
    }

    // A helper function to combine waiting for an element to have rendered and then asserting on its contents.
    t.context.assertElementText = async (t, $elem, expectedText, message) => {
        try {
            await t.context.waitUntilElementHasText($elem, expectedText)
        } catch (e) {
            // If we got a TimeoutError because the element did not have the text we expected, just swallow it here
            // and let the assertion on blow up instead. That will produce a clearer error message.
            if (e.name !== 'TimeoutError') {
                throw e
            }
        }
        t.is(await $elem.getText(), expectedText, message)
    }

    t.context.assertElementNotPresent = async (t, cssSelector, message) => {
        try {
            await t.context.driver.wait(
                async () => {
                    try {
                        return !(await t.context.$(cssSelector))
                    } catch (e) {
                        if (e.name === 'TimeoutError') {
                            return true
                        }
                        throw e
                    }
                },
                fiveSecondsMs, 
                `Element was still present after ${fiveSecondsMs} milliseconds`
            )
        } catch (e) {
            if (e.name === 'TimeoutError') {
                t.fail(`Element with css selector '${cssSelector}' was still present after ${fiveSecondsMs} milliseconds`)
            } else {
                throw e
            }
        }
        t.pass(message || 'Element was not present')
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

    let {assertElementText, assertElementNotPresent, $, $$} = t.context

    await t.context.get('/')

    // Use a CSS selector to find an element that we care about on the page.
    let [$reportsPending, $draftReports, $orgReports, $upcomingEngagements] = await $$('.home-tile h1')

    await assertElementText(t, $reportsPending, '0')
    await assertElementText(t, $draftReports, '0')
    await assertElementText(t, $orgReports, '2')
    await assertElementText(t, $upcomingEngagements, '0')

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

test.only('Report validation', async t => {
    t.plan(5)

    let {assertElementText, $} = t.context

    await t.context.get('/')
    let $createButton = await $('#createButton')
    await $createButton.click()
    await assertElementText(t, await $('.legend .title-text'), 'Create a new Report')

    let $meetingGoal = await $('.meeting-goal')
    t.false(
        _includes(await $meetingGoal.getAttribute('class'), 'has-warning'), 
        'Meeting goal does not start in a warning state'
    )

    let $meetingGoalInput = await $('#intent')
    await $meetingGoalInput.click()

    let $searchBarInput = await $('#searchBarInput')
    await $searchBarInput.click()

    t.true(
        _includes(await $meetingGoal.getAttribute('class'), 'has-warning'), 
        'Meeting goal enters warning state when the user leaves the field without entering anything'
    )

    await $meetingGoalInput.sendKeys('talk about logistics')
    t.false(
        _includes(await $meetingGoal.getAttribute('class'), 'has-warning'), 
        'After typing in meeting goal field, warning state goes away'
    )

    let $engagementDate = await $('#engagementDate')
    await $engagementDate.click()

    let $todayButton = await $('.u-today-button')
    await $todayButton.click()

    t.is(
        await $engagementDate.getAttribute('value'), 
        moment().format('DD/MM/YYYY'), 
        'Clicking the "today" button puts the current date in the engagement field'
    )
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