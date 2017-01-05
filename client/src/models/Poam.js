import Model from 'components/Model'

export default class Poam extends Model {
	static schema = {
		shortName: '',
		longName: '',
		category: '',
		responsibleOrg: {},
		parentPoam: {},
		childrenPoams: [],
	}

	toString() {
		return this.longName || this.shortName || "Unnamed"
	}
}
