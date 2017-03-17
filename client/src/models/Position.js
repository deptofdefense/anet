import Model from 'components/Model'
import utils from 'utils'

import RS_ICON from 'resources/rs_small.png'
import AFG_ICON from 'resources/afg_small.png'

export default class Position extends Model {
	static resourceName = 'Position'
	static listName = 'positionList'

	static schema = {
		name: '',
		type: '',
		code: '',
		status: 'ACTIVE',
		associatedPositions: [],
		organization: {},
		person: {},
		location: {},
	}

	humanNameOfType() {
		if (this.type === 'PRINCIPAL') {
			return "Afghan principal"
		} else {
			return "NATO " + utils.noCase(this.type)
		}
	}

	isPrincipal() {
		return this.type === 'PRINCIPAL'
	}

	toString() {
		return this.code || this.name
	}

	iconUrl() {
		if (this.type === 'PRINCIPAL') {
			return AFG_ICON
		}

		return RS_ICON
	}
}
