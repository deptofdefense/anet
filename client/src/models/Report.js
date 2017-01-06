import Model from 'components/Model'

export default class Report extends Model {
	static schema = {
		intent: '',
		engagementDate: null,
		atmosphere: '',
		atmosphereDetails: '',
		location: {},
		attendees: [],
		poams: [],
		comments: [],
		reportText: '',
		nextSteps: '',
	}

	isDraft() {
		return this.state === 'DRAFT'
	}

	toString() {
		return this.intent || "None"
	}
}
