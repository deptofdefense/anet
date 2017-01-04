import Model from 'components/Model'

export default class Position extends Model {
	static schema = {
		name: '',
		type: '',
		code: '',
		associatedPositions: [],
		organization: {},
		person: {},
		location: {},
	}
}
