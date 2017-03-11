import Model from 'components/Model'

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

	toString() {
		return this.code || this.name
	}

	iconUrl() {
		if (this.type === 'ADVISOR') {
			return RS_ICON
		} else if (this.type === 'PRINCIPAL') {
			return AFG_ICON
		}

		return ''
	}
}
