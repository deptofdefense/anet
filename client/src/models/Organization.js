import Model from 'models/Model'

export default class Organization extends Model {
	static schema = {
		name: '',
		type: '',
		parentOrg: null,
		childrenOrgs: [],
		approvalSteps: [],
		positions: [],
	}
}
