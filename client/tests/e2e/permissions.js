let test = require('../util/test')

test('checking super user permissions', async t => {
    t.plan(0)

    await t.context.get('/', 'rebecca')
    await t.context.pageHelpers.clickMyOrgLink()
})