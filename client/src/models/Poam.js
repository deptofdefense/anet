import React, {PropTypes} from 'react'

import Model from 'components/Model'

export default class Poam extends Model {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	static resourceName = 'Poam'
	static displayName(appSettings) {
		return appSettings.POAM_SHORT_NAME
	}
	//'PoAM'

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
