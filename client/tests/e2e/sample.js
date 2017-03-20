let test = require('ava'),
    webdriver = require('selenium-webdriver'),
    By = webdriver.By

test.beforeEach(t => {
    t.context.driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build()

    t.context.get = pathname => t.context.driver.get(`http://localhost:3000${pathname}`)
})

test.afterEach(async t => {
    await t.context.driver.quit()
})

test('My ANET snapshot', async t => {
    t.plan(1)
    await t.context.get('/')
    let reportsPendingMyApproval = await t.context.driver.findElement(By.css('.home-tile:first h1')).getText()
    t.equal(reportsPendingMyApproval, '0')
})
