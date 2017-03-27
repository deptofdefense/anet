let test = require('../util/test'),
    guid = require('guid')

test('checking super user permissions', async t => {
    t.plan(1)

    let {$, $$, assertElementText} = t.context

    await t.context.get('/', 'rebecca')
    await t.context.pageHelpers.clickMyOrgLink()

    let $superUserLinks = await $$('#superUsers p a')
    let $rebeccaLink
    for (let $superUserLink of $superUserLinks) {
        let superUserName = await $superUserLink.getText()
        if (superUserName === 'CTR Rebecca Beccabon') {
            $rebeccaLink = $superUserLink
            break
        }
    }

    if (!$rebeccaLink) {
        t.fail('Could not find Rebecca as a superuser of her own org. The data does not match what this test expects.')
    }

    await $rebeccaLink.click()
    let $editPersonButton = await $('.edit-person')
    await t.context.driver.wait(t.context.until.elementIsVisible($editPersonButton))
    await $editPersonButton.click()

    let fakeBioText = `fake bio ${guid.raw()} `
    let $bioTextArea = await $('.biography .text-editor')
    let originalBioText = await $bioTextArea.getText()
    await $bioTextArea.sendKeys(fakeBioText)

    let $formBottomSubmit = await $('#formBottomSubmit')
    await $formBottomSubmit.click()

    await assertElementText(t, await $('#biography p'), fakeBioText + originalBioText)
})