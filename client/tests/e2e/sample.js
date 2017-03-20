let test = require('ava'),
    webdriver = require('selenium-webdriver'),
    geckodriver = require('geckodriver'),
    By = webdriver.By

webdriver.promise.USE_PROMISE_MANAGER = false

test.before(() => geckodriver.start())

test.beforeEach(t => {
    t.context.driver = new webdriver.Builder()
        .forBrowser('firefox')
        .build()

    t.context.get = async pathname => {
        await t.context.driver.get(`http://localhost:3000${pathname}`)
        // await new Promise(resolve => setTimeout(resolve, 5000))
        // await t.context.driver.wait(webdriver.until.alertIsPresent())
        // try {
        //     let alert = await t.context.driver.switchTo().alert()
        //     await alert.authenticateAs('erin', 'erin')
        // } catch (e) {
        //     if (e.code !== 27) {
        //         throw e
        //     }
        // }
    }
})

test.afterEach.always(async t => {
    if (t.context.driver) {
        await t.context.driver.quit()
    }
})

test.after.always(() => geckodriver.stop())

test('My ANET snapshot', async t => {
    t.plan(1)
    await t.context.get('/')
    let reportsPendingMyApproval = await t.context.driver.findElement(By.css('.home-tile:first-child h1')).getText()
    t.is(reportsPendingMyApproval, '0')
})
