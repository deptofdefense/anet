import Model from 'components/Model'

import RS_ICON from 'resources/rs_small.png'
import AFG_ICON from 'resources/afg_small.png'

export default class Person extends Model {
	static resourceName = 'Person'
	static listName = 'personList'

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

	static humanNameOfRole(role) {
		if (role === 'ADVISOR') {
			return 'NATO Member'
		}
		if (role === 'PRINCIPAL') {
			return 'Principal'
		}

		throw new Error(`Unrecognized role: ${role}`)
	}

	getHumanNameOfRole() {
		return Person.humanNameOfRole(this.role)
	}

	isNewUser() {
		return this.status === 'NEW_USER'
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

	//Checks if this user is a valid super user for a particular organization
	//Must be either
	// - An Administrator
	// - A super user and this org is a PRINCIPAL_ORG
	// - A super user for this organization
	// - A super user for this orgs parents.
	isSuperUserForOrg(org) {
		if (!org) { return false }
		if (this.position && this.position.type === 'ADMINISTRATOR') { return true }
		if (this.position && this.position.type !== 'SUPER_USER') { return false }
		if (org.type === 'PRINCIPAL_ORG') { return true }

		if (!this.position || !this.position.organization) { return false }
		let orgs = this.position.organization.allDescendantOrgs || []
		orgs.push(this.position.organization)
		let orgIds = orgs.map(o => o.id)

		return orgIds.includes(org.id)
	}

	iconUrl() {
		if (this.role === 'ADVISOR') {
			return RS_ICON
		} else if (this.role === 'PRINCIPAL') {
			return AFG_ICON
		}

		return ''
	}

	toString() {
		if (this.rank) {
			return this.rank + " " + this.name
		} else {
			return this.name || this.id
		}
	}

}
