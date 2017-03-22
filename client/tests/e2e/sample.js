let test = require('ava'),
    webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    chalk = require('chalk')

// This gives us access to send Chrome commands.
require('chromedriver')

// Webdriver's promise manager only made sense before Node had async/await support.
// Now it's a deprecated legacy feature, so we should use the simpler native Node support instead.
webdriver.promise.USE_PROMISE_MANAGER = false

console.log(
    chalk.bold.cyan('These tests assume that you have just run ../insertSqlBaseData.sql on your SQLServer instance')
)

// We use the beforeEach hook to put helpers on t.context and set up test scaffolding.
test.beforeEach(t => {
    t.context.driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build()

    // This method is a helper so we don't have to keep repeating the hostname.
    // Passing the authentication through the querystring is a hack so we can
    // pass the information along via window.fetch. 
    t.context.get = async pathname => 
        await t.context.driver.get(`http://localhost:3000${pathname}?user=erin&pass=erin`)

    // For debugging purposes.
    t.context.waitForever = async () => {
        console.log(chalk.red('Waiting forever so you can debug...'))
        await t.context.driver.wait(() => {})
    }

    t.context.$ = cssSelector => t.context.driver.findElement(By.css(cssSelector))
    t.context.$$ = cssSelector => t.context.driver.findElements(By.css(cssSelector))

    // This helper method is necessary because we don't know when React has finished rendering the page.
    // We will wait for it to be done, with a max timeout so the test does not hang if the rendering fails.
    let fiveSecondsMs = 5000
    t.context.waitUntilElementHasText = async (elem, expectedText) => 
        await t.context.driver.wait(async () => {
            let text = await elem.getText()
            return text === expectedText
        }, fiveSecondsMs, `Element did not have text '${expectedText}' within ${fiveSecondsMs} milliseconds`)

    // A helper function to combine waiting for an element to have rendered and then asserting on its contents.
    t.context.assertElementText = async (t, elem, expectedText) => {
        try {
            await t.context.waitUntilElementHasText(elem, expectedText)
        } catch (e) {
            // If we got a TimeoutError because the element did not have the text we expected, just swallow it here
            // and let the assertion on blow up instead. That will produce a clearer error message.
            if (e.name !== 'TimeoutError') {
                throw e
            }
        }
        t.is(await elem.getText(), expectedText)
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
    t.plan(5)

    let {assertElementText, $, $$} = t.context

    await t.context.get('/')

    // Use a CSS selector to find an element that we care about on the page.
    let [$reportsPending, $draftReports, $orgReports, $upcomingEngagements] = await $$('.home-tile h1')

    await assertElementText(t, $reportsPending, '0')
    await assertElementText(t, $draftReports, '0')
    await assertElementText(t, $orgReports, '2')
    await assertElementText(t, $upcomingEngagements, '0')

    await $('.persistent-tour-launcher').click()
    let $hopscotchTitle = await $('.hopscotch-title')
    await assertElementText(t, $hopscotchTitle, 'Welcome')
})
