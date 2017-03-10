import Model from 'components/Model'
import moment from 'moment'
import Person from 'models/Person'

export default class Report extends Model {
	static resourceName = 'Report'
	static listName = 'reportList'

	static schema = {
		intent: '',
		engagementDate: null,
		cancelledReason: null,
		atmosphere: null,
		atmosphereDetails: '',
		location: {},
		attendees: [],
		poams: [],
		comments: [],
		reportText: '',
		nextSteps: '',
		keyOutcomes: '',
	}

	isDraft() {
		return this.state === 'DRAFT'
	}

	isPending() {
		return this.state === 'PENDING_APPROVAL'
	}

	isRejected() {
		return this.state === 'REJECTED'
	}

	toString() {
		return this.intent || 'None'
	}

	validateForSubmit() {
		let errors = []

		let isCancelled = this.cancelledReason ? true : false
		if (!isCancelled) {
			if (!this.atmosphere) {
				errors.push('You must provide the overall atmosphere of the engagement')
			} else {
				if (this.atmosphere !== 'POSITIVE' && !this.atmosphereDetails) {
					errors.push('You must provide atmosphere details if the engagement was not Positive')
				}
			}
		}
		if (!this.engagementDate) {
			errors.push('You must provide the Date of Engagement')
		} else if (!isCancelled && moment(this.engagementDate).isAfter(moment().endOf('day'))) {
			errors.push('You cannot submit reports for future dates, except for cancelled engagements')
		}

		let primaryPrincipal = this.getPrimaryPrincipal()
		let primaryAdvisor = this.getPrimaryAdvisor()
		if (!primaryPrincipal) {
			errors.push('You must provide the primary Princpal for the Engagement')
		}
		if (!primaryAdvisor) {
			errors.push('You must provide the primary Advisor for the Engagement')
		}

		if (!this.nextSteps) {
			errors.push('You must provide a brief summary of the Next Steps')
		}
		if (!isCancelled && !this.keyOutcomes) {
			errors.push('You must provide a brief summary of the Key Outcomes')
		}
		return errors
	}

	getPrimaryPrincipal() {
		return this.attendees.find( el =>
			el.role === 'PRINCIPAL' && el.primary
		)
	}

	getPrimaryAdvisor() {
		return this.attendees.find( el =>
			el.role === 'ADVISOR' && el.primary
		)
	}

	addAttendee(newAttendee) {
		if (!newAttendee || !newAttendee.id) {
			return
		}

		let attendees = this.attendees

		if (attendees.find(attendee => attendee.id === newAttendee.id)) {
			return
		}

		let person = new Person(newAttendee)
		person.primary = false

		if (!attendees.find(attendee => attendee.role === person.role && attendee.primary)) {
			person.primary = true
		}

		this.attendees.push(person)
	}

}
