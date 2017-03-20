let test = require('ava'),
    webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    $ = By.css,
    chalk = require('chalk')

require('chromedriver')

webdriver.promise.USE_PROMISE_MANAGER = false

test.beforeEach(t => {
    t.context.driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build()

    t.context.get = async pathname => 
        await t.context.driver.get(`http://localhost:3000${pathname}?user=erin&pass=erin`)

    t.context.waitForever = async () => {
        console.log(chalk.red('Waiting forever so you can debug...'))
        await t.context.driver.wait(() => {})
    }

    let fiveSecondsMs = 5000
    t.context.waitUntilElementHasText = async (elem, expectedText) => 
        await t.context.driver.wait(async () => {
            let text = await elem.getText()
            return text === expectedText
        }, fiveSecondsMs, `Element did not have text '${expectedText}' within ${fiveSecondsMs} milliseconds`)
})

test.afterEach.always(async t => {
    if (t.context.driver) {
        await t.context.driver.quit()
    }
})

test('My ANET snapshot', async t => {
    t.plan(1)
    await t.context.get('/')
    let reportsPendingMyApprovalElem = t.context.driver.findElement($('.home-tile:first-child h1'))
    await t.context.waitUntilElementHasText(reportsPendingMyApprovalElem, '0')
    t.is(await reportsPendingMyApprovalElem.getText(), '0')
})
