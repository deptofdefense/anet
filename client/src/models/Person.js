import Model from 'models/Model'

export default class Person extends Model {
	static resourceName = 'people'

	static schema = {
		name: '',
		country: '',
		rank: '',
		gender: '',
		phoneNumber: '',
		endOfTourDate: new Date(),
		biography: '',
		role: '',
		position: {},
	}
}
