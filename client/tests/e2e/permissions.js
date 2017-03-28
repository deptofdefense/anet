let test = require('../util/test'),
    moment = require('moment'),
    guid = require('guid')

test('checking super user permissions', async t => {
    t.plan(6)

    await t.context.get('/', 'rebecca')
    await t.context.pageHelpers.clickMyOrgLink()

    let $rebeccaLink = await findSuperUserLink(t, 'CTR Rebecca Beccabon')
    await $rebeccaLink.click()

    await validateUserCanEditUserForCurrentPage(t)
    await editAndSavePositionFromCurrentUserPage(t)

    await t.context.pageHelpers.clickMyOrgLink()
    let $jacobLink = await findSuperUserLink(t, 'CIV Jacob Jacobson')

    await $jacobLink.click()
    await validateUserCanEditUserForCurrentPage(t)
    
    await editAndSavePositionFromCurrentUserPage(t)
})

test('super user cannot edit administrator', async t => {
    t.plan(2)

    let {$, $$, assertElementNotPresent} = t.context

    await t.context.get('/', 'rebecca')

    let $searchBar = await $('#searchBarInput')
    await $searchBar.sendKeys('arthur')

    let $searchBarSubmit = await $('#searchBarSubmit')
    await $searchBarSubmit.click()

    async function getArthurFromSearchResults() {
        let $searchResultLinks = await $$('.people-search-results td a')

        async function findLinkWithText(text) {
            for (let $link of $searchResultLinks) {
                let linkText = await $link.getText()
                if (linkText === text) {
                    return $link
                }
            }
            return null
        }

        let $arthurPersonLink = await findLinkWithText('CIV Arthur Dmin')
        let $arthurPositionLink = await findLinkWithText('ANET Administrator')

        if (!$arthurPersonLink || !$arthurPositionLink) {
            t.fail('Could not find Arthur Dmin when searching for "arthur". The data does not match what this test expects.')
        }

        return [$arthurPersonLink, $arthurPositionLink]
    }

    let [$arthurPersonLink] = await getArthurFromSearchResults()
    await $arthurPersonLink.click()
    await assertElementNotPresent(t, '.edit-person', 'Rebecca should not be able edit an administrator')

    await t.context.driver.navigate().back()

    let $arthurPositionLink = (await getArthurFromSearchResults())[1]
    await $arthurPositionLink.click()
    await assertElementNotPresent(t, '.edit-position', 'Rebecca should not be able edit the "ANET Administrator" position')
})

test('checking admin permissions', async t => {
    t.plan(3)

    await t.context.get('/', 'arthur')
    await t.context.pageHelpers.clickMyOrgLink()
    let $arthurLink = await findSuperUserLink(t, 'CIV Arthur Dmin')
    await $arthurLink.click()

    await validateUserCanEditUserForCurrentPage(t)
    await editAndSavePositionFromCurrentUserPage(t)
})

async function findSuperUserLink(t, desiredSuperUserName) {
    let $superUserLinks = await t.context.$$('#superUsers p a')
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

async function validateUserCanEditUserForCurrentPage(t) {
    let {$, assertElementText} = t.context

    let $editPersonButton = await $('.edit-person')
    await t.context.driver.wait(t.context.until.elementIsVisible($editPersonButton))
    await $editPersonButton.click()

    let $bioTextArea = await $('.biography .text-editor')
    await t.context.driver.wait(
        async () => {
            let originalBioText = await $bioTextArea.getText()
            return originalBioText !== ''
        }, 
        moment.duration(5, 'seconds').asMilliseconds(), 
        'This test assumes that the current user has a non-empty biography.'
    )
    let originalBioText = await $bioTextArea.getText()

    let fakeBioText = `fake bio ${guid.raw()} `
    await $bioTextArea.sendKeys(fakeBioText)

    await t.context.pageHelpers.clickFormBottomSubmit()

    await assertElementText(t, await $('.alert'), 'Person saved successfully')
    await assertElementText(t, await $('#biography p'), fakeBioText + originalBioText)
}

async function editAndSavePositionFromCurrentUserPage(t) {
    let {$, assertElementText, until} = t.context

    let $positionName = await $('.position-name')
    await $positionName.click()
    let $editButton = await $('.edit-position')
    await t.context.driver.wait(until.elementIsVisible($editButton))
    await $editButton.click()
    await t.context.pageHelpers.clickFormBottomSubmit()

    await assertElementText(t, await $('.alert'), 'Saved Position')
}