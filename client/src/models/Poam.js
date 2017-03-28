import React from 'react'

import Model from 'components/Model'

export default class Poam extends Model {
	static resourceName = 'Poam'
	static displayName = 'PoAM'
	static listName = 'poamList'

	static schema = {
		shortName: '',
		longName: '',
		category: '',
		responsibleOrg: {},
		parentPoam: {},
		childrenPoams: [],
	}

	static autocompleteQuery = "id, shortName, longName"

	static autocompleteTemplate(poam) {
		return <span>{[poam.shortName, poam.longName].join(' - ')}</span>
	}

	toString() {
		return this.longName || this.shortName || 'Unnamed'
	}
}
