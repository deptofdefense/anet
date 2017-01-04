import Model from 'components/Model'

export default class Person extends Model {
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
