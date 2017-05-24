import Model from 'components/Model'
import dict from 'dictionary'

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
			return dict.lookup('PRINCIPAL_POSITION_NAME')
		} else if (this.type === 'ADVISOR') {
			return dict.lookup('ADVISOR_POSITION_TYPE_TITLE')
		} else if (this.type === 'SUPER_USER') {
			return dict.lookup('SUPER_USER_POSITION_TYPE_TITLE')
		} else if (this.type === 'ADMINISTRATOR') {
			return dict.lookup('ADMINISTRATOR_POSITION_TYPE_TITLE')
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
