import Model from 'components/Model'

export default class Position extends Model {
	static resourceName = "Position"

	static schema = {
		name: '',
		type: '',
		code: '',
		associatedPositions: [],
		organization: {},
		person: {},
		location: {},
	}

	toString() {
		return this.code || this.name
	}

	iconUrl() {
		if (this.type === "ADVISOR") {
			return "/assets/img/rs_small.png"
		} else if (this.type === "PRINCIPAL") {
			return "/assets/img/afg_small.png"
		}
		return ""
	}
}
