import Model from 'components/Model'

export default class Report extends Model {
	static resourceName = "Report"

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
		nextStepsSummary: '',
		nextSteps: '',
		keyOutcomesSummary: '',
		keyOutcomes: ''
	}

	isDraft() {
		return this.state === 'DRAFT'
	}

	isPending() {
		return this.state === 'PENDING_APPROVAL'
	}

	toString() {
		return this.intent || "None"
	}
}
