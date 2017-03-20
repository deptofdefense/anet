let test = require('ava'),
    webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until

test.beforeEach(t => {
    t.context.driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build()
})

test('Google test', async t => {
    t.context.driver.get('http://www.google.com/ncr')
    t.context.driver.findElement(By.name('q')).sendKeys('webdriver')
    t.context.driver.findElement(By.name('btnG')).click()
    t.context.driver.wait(until.titleIs('webdriver - Google Search'), 1000)
    await t.context.driver.quit()
})
