let test = require('../util/test')

test('Move someone in and out of a position', async t => {
    t.plan(8)

    let {$, $$, assertElementText, By, until} = t.context

    await t.context.get('/', 'rebecca')

    async function clickMyOrgLink() {
        let $myOrgLink = await $('#my-organization')
        await $myOrgLink.click()
    }

    await clickMyOrgLink()

    let positionName = 'EF2.2 Advisor D'
    let personName = 'Civ Erin Erinson'

    let $supportedPositionsRows = await $$('#supportedPositions table tbody tr')
    let $erinCell
    for (let $row of $supportedPositionsRows) {
        let [$billetCell, $advisorCell] = await $row.findElements(By.css('td'))
        let billetText = await $billetCell.getText()
        let advisorText = await $advisorCell.getText()

        if (billetText === positionName && advisorText === personName) {
            $erinCell = $advisorCell
            break
        }
    }

    if (!$erinCell) {
        t.fail('Could not find Erin Erinson in the supported positions table. ' +
            'Please fix the database to be the way this test expects.')
    }

    await t.context.driver.wait(until.elementIsVisible($erinCell))
    let $erinLink = await $erinCell.findElement(By.css('a'))
    await $erinLink.click()

    let $changeAssignedPositionButton = await $('.change-assigned-position')
    await $changeAssignedPositionButton.click()

    let $removePersonButton = await $('.remove-person-from-position')
    await $removePersonButton.click()

    await assertElementText(t, await $('p.not-assigned-to-position-message'), 'Erin Erinson is not assigned to a position.')
    
    await clickMyOrgLink()

    let $vacantPositionRows = await $$('#vacantPositions table tbody tr')
    let $positionToFillCell
    for (let $row of $vacantPositionRows) {
        let [$billetCell, $advisorCell] = await $row.findElements(By.css('td'))
        let billetText = await $billetCell.getText()
        let advisorText = await $advisorCell.getText()

        if (billetText === positionName && advisorText === 'Unfilled') {
            $positionToFillCell = $billetCell
            break
        }
    }

    if (!$positionToFillCell) {
        t.fail(`Could not find ${positionName} in the vacant positions table.`)
    }

    await t.context.driver.wait(until.elementIsVisible($positionToFillCell))
    let $positionToFillLink = await $positionToFillCell.findElement(By.css('a'))
    await $positionToFillLink.click()
    let currentPathname = await t.context.getCurrentPathname()
    t.regex(currentPathname, /positions\/\d+/, 'URL is updated to positions/show page')

    await assertElementText(t, await $('.legend .title-text'), positionName)
    await assertElementText(t, await $('.position-empty-message'), `${positionName} is currently empty.`)

    let $changeAssignedPersonButton = await $('button.change-assigned-person')
    await $changeAssignedPersonButton.click()

    await t.context.pageHelpers.chooseAutocompleteOption('.select-person-autocomplete', personName)
    let $saveButton = await $('button.save-button')
    await $saveButton.click()

    await assertElementText(t, await $('h4.assigned-person-name'), personName)

    let $personLink = await $('h4.assigned-person-name a')
    await $personLink.click()
    currentPathname = await t.context.getCurrentPathname()
    t.regex(currentPathname, /people\/\d+/, 'URL is updated to people/show page')

    await assertElementText(t, await $('.position-name'), positionName)

    await clickMyOrgLink()

    $supportedPositionsRows = await $$('#supportedPositions table tbody tr')
    let foundCorrectRow = false
    for (let $row of $supportedPositionsRows) {
        let [$billetCell, $advisorCell] = await $row.findElements(By.css('td'))
        let billetText = await $billetCell.getText()
        let advisorText = await $advisorCell.getText()

        if (billetText === positionName && advisorText === personName) {
            foundCorrectRow = true
            break
        }
    }
    t.true(foundCorrectRow, `Could not find ${positionName} and ${personName} in the supported positions table`)
})
