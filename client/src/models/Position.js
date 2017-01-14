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
}
