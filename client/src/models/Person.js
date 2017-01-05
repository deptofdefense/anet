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

	isAdmin() {
		return this.position && this.position.type === 'ADMINISTRATOR'
	}

	isSuperUser() {
		return this.position && (
			this.position.type === 'SUPER_USER' ||
			this.position.type === 'ADMINISTRATOR'
		)
	}
}
