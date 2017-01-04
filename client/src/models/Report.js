import Model from 'components/Model'

export default class Report extends Model {
	static schema = {
		intent: '',
		engagementDate: null,
		atmosphere: null,
		location: {},
		attendees: [],
		poams: [],
		reportText: '',
		nextSteps: '',
	}
}
