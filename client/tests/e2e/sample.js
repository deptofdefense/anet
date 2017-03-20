let test = require('ava'),
    webdriver = require('selenium-webdriver'),
    By = webdriver.By

require('chromedriver')

webdriver.promise.USE_PROMISE_MANAGER = false

test.beforeEach(t => {
    t.context.driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build()

    t.context.get = async pathname => {
        await t.context.driver.get(`http://localhost:3000${pathname}?user=erin&pass=erin`)
    }

    t.context.waitForever = () => t.context.driver.wait(() => {})
})

test.afterEach.always(async t => {
    if (t.context.driver) {
        await t.context.driver.quit()
    }
})

// test.after.always(() => geckodriver.stop())

test('My ANET snapshot', async t => {
    t.plan(1)
    await t.context.get('/')
    await t.context.waitForever()
    let reportsPendingMyApproval = await t.context.driver.findElement(By.css('.home-tile:first-child h1')).getText()
    t.is(reportsPendingMyApproval, '0')
})
