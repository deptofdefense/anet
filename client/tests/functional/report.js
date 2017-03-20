define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!leadfoot/keys',
	'require'
], function (registerSuite, assert, keys, require) {
	var url = 'http://localhost:3000';

	registerSuite({
		name: 'Report (functional)',

		'submit form': function () {
			return this.remote
                .setTimeout("implicit",10000)
				.get(require.toUrl(url))
				.findById('createButton')
					.setTimeout("implicit",200)
					.click() .end()
				.findByCssSelector("#root > div > header > div > div.pull-right > div > ul > li:nth-child(1) > a")
					.click() .end()
				.findByCssSelector("#intent")
					.click()
					.type('Test case 1')
					.pressKeys(keys.TAB)
					.end()
				.findByCssSelector("#date-picker-popover-0 > div.popover-content > table > tfoot > tr > td > button")
					.click() .end()
				.findById('location')
					.type('MOD')
					.end()
				.sleep(100)
				.findById('react-autowhatever-1--item-0')
					.click().end()
				.sleep(100)
				.findByCssSelector('#root > div > div.container > div > form > fieldset:nth-child(1) > div:nth-child(5) > div > div > button:nth-child(2)')
					.click().end()
				.findById('atmosphereDetails')
					.type("Good, but not great atmosphere").end()
				.findById('attendees')
					.type("Chris")
					.end()
				.sleep(100)
				.findById('react-autowhatever-1--item-0')
					.click().end()
				.findById('poams')
					.type('ef2').end()
				.sleep(100)
				.findById('react-autowhatever-1--item-0')
					.click().end()
				.findById('keyOutcomesSummary')
					.type('Some Outcomes').end()
				.findById('nextStepsSummary')
					.type('Some Steps').end()
				.findByCssSelector('#root > div > div.container > div > form > fieldset:nth-child(5) > button')
					.click().end()
					.sleep(100)
				.then(function () {
					assert.ok(1 == 1, 'One should equal one.');
				});
		}
	});
});
