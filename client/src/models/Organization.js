import Model from 'components/Model'

export default class Organization extends Model {
	static schema = {
		name: '',
		type: '',
		parentOrg: null,
		childrenOrgs: [],
		approvalSteps: [],
		positions: [],
		poams: []
	}

	isAdvisorOrg() {
		return this.type === 'ADVISOR_ORG'
	}
}
