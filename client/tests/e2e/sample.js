let test = require('ava'),
    webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    $ = By.css,
    chalk = require('chalk')

// This gives us access to send Chrome commands.
require('chromedriver')

// Webdriver's promise manager only made sense before Node had async/await support.
// Now it's a deprecated legacy feature, so we should use the simpler native Node support instead.
webdriver.promise.USE_PROMISE_MANAGER = false

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

    // This helper method is necessary because we don't know when React has finished rendering the page.
    // We will wait for it to be done, with a max timeout so the test does not hang if the rendering fails.
    let fiveSecondsMs = 5000
    t.context.waitUntilElementHasText = async (elem, expectedText) => 
        await t.context.driver.wait(async () => {
            let text = await elem.getText()
            return text === expectedText
        }, fiveSecondsMs, `Element did not have text '${expectedText}' within ${fiveSecondsMs} milliseconds`)
})

// Shut down the browser when we are done.
test.afterEach.always(async t => {
    if (t.context.driver) {
        await t.context.driver.quit()
    }
})

test('My ANET snapshot', async t => {
    // We can use t.plan() to indicate how many assertions we plan to make.
    // This provides safety in case there's a silent failure and the test
    // looks like it exited successfully, when in fact it just died. I've 
    // seen people get bit by that a done with frameworks like Mocha which
    // do not offer test planning.
    t.plan(1)

    await t.context.get('/')

    // Use a CSS selector to find an element that we care about on the page.
    let reportsPendingMyApprovalElem = t.context.driver.findElement($('.home-tile:first-child h1'))

    // Wait until the element has the text we want, which means that React has finished loading.
    await t.context.waitUntilElementHasText(reportsPendingMyApprovalElem, '0')

    // Make an assertion about what the element should say.
    t.is(await reportsPendingMyApprovalElem.getText(), '0')
})
