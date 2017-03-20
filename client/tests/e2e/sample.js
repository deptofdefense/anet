let test = require('ava'),
    webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until

test.beforeEach(t => {
    t.context.driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build()

    t.context.get = pathname => t.context.driver.get(`http://localhost:3000/${pathname}`)
})

test.afterEach(async t => {
    await t.context.driver.quit()
})

test('First test', async t => {
    t.context.get('/')
    t.context.driver.findElement(By.name('q')).sendKeys('webdriver')
    t.context.driver.findElement(By.name('btnG')).click()
    t.context.driver.wait(until.titleIs('webdriver - Google Search'), 1000)
})

