import Model from 'components/Model'

export default class Person extends Model {
	static schema = {
		name: '',
		status: 'ACTIVE',
		country: '',
		rank: '',
		gender: 'MALE',
		phoneNumber: '',
		endOfTourDate: '',
		biography: '',
		role: 'PRINCIPAL',
		position: {},
	}
}
