import Model from 'components/Model'

export default class Person extends Model {
	static resourceName = "Person"

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

	isAdvisor() {
		return this.role === 'ADVISOR'
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

	isSuperUserForOrg(org) {
		if (!org) { return false }
		if (this.position && this.position.type === "ADMINISTRATOR") { return true; }

		return this.position && this.position.organization && (
			this.position.type === 'SUPER_USER' &&
			this.position.organization.id === org.id
		)
	}
}
