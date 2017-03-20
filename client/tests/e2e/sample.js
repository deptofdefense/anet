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

    t.context.get = async pathname => {
        await t.context.driver.get(`http://localhost:3000${pathname}?user=erin&pass=erin`)
        await t.context.driver.wait(webdriver.until.elementLocated($('body.done-loading')), 10000, 'Page did not finish XHR loading within the timeout.')
    }

    t.context.waitForever = async () => {
        console.log(chalk.red('Waiting forever so you can debug...'))
        await t.context.driver.wait(() => {})
    }
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
    await new Promise(resolve => setTimeout(resolve, 2000))
    let reportsPendingMyApproval = await t.context.driver.findElement($('.home-tile:first-child h1')).getText()
    t.is(reportsPendingMyApproval, '0')
})
