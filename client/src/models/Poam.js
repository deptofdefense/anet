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
}
