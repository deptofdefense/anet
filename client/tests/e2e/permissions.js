let test = require('../util/test'),
    moment = require('moment'),
    guid = require('guid')

test('checking super user permissions', async t => {
    t.plan(5)

    let {$, $$, assertElementText} = t.context

    await t.context.get('/', 'rebecca')
    await t.context.pageHelpers.clickMyOrgLink()

    async function findSuperUserLink(desiredSuperUserName) {
        let $superUserLinks = await $$('#superUsers p a')
        let $foundLink
        for (let $superUserLink of $superUserLinks) {
            let superUserName = await $superUserLink.getText()
            if (superUserName === desiredSuperUserName) {
                $foundLink = $superUserLink
                break
            }
        }

        if (!$foundLink) {
            t.fail(`Could not find superuser '${desiredSuperUserName}'. The data does not match what this test expects.`)
        }

        return $foundLink
    }

    async function clickEditPersonButton() {
        let $editPersonButton = await $('.edit-person')
        await t.context.driver.wait(t.context.until.elementIsVisible($editPersonButton))
        await $editPersonButton.click()
    }

    let $rebeccaLink = await findSuperUserLink('CTR Rebecca Beccabon')
    await $rebeccaLink.click()

    await clickEditPersonButton()

    let $bioTextArea = await $('.biography .text-editor')
    await t.context.driver.wait(async () => {
        let originalBioText = await $bioTextArea.getText()
        return originalBioText !== ''
    }, moment.duration(5, 'seconds').asMilliseconds())
    let originalBioText = await $bioTextArea.getText()

    let fakeBioText = `fake bio ${guid.raw()} `
    await $bioTextArea.sendKeys(fakeBioText)

    await t.context.pageHelpers.clickFormBottomSubmit()

    await assertElementText(t, await $('.alert'), 'Person saved successfully')
    await assertElementText(t, await $('#biography p'), fakeBioText + originalBioText)

    async function editAndSavePosition() {
        let $positionName = await $('.position-name')
        await $positionName.click()
        let $editButton = await $('.edit-position')
        await $editButton.click()
        await t.context.pageHelpers.clickFormBottomSubmit()

        await assertElementText(t, await $('.alert'), 'Saved Position')
    }

    await editAndSavePosition()

    await t.context.pageHelpers.clickMyOrgLink()
    let $jacobLink = await findSuperUserLink('CIV Jacob Jacobson')
    await $jacobLink.click()
    await clickEditPersonButton()
    await t.context.pageHelpers.clickFormBottomSubmit()

    await assertElementText(t, await $('.alert'), 'Person saved successfully')
    
    await editAndSavePosition()
})