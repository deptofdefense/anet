let test = require('ava'),
    webdriver = require('selenium-webdriver'),
    By = webdriver.By

webdriver.promise.USE_PROMISE_MANAGER = false

test.beforeEach(t => {
    t.context.driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build()

    t.context.get = pathname => t.context.driver.get(`http://localhost:3000${pathname}`)
})

test.afterEach.always(async t => {
    await t.context.driver.quit()
})

test('My ANET snapshot', async t => {
    t.plan(1)
    await t.context.get('/')
    let reportsPendingMyApproval = await t.context.driver.findElement(By.css('.home-tile:first-child h1')).getText()
    t.is(reportsPendingMyApproval, '0')
})
