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

	toString() {
		return this.longName || this.shortName || 'Unnamed'
	}
}
