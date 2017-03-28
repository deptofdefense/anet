import React, {Component} from 'react'
import autobind from 'autobind-decorator'

export default class ReportStateSearch extends Component {
	render() {
		let {value} = this.props

		return <div>
			<select value={value.state} onChange={this.onChange} ref={(el) => this.stateSelect = el}>
				<option value="DRAFT">Draft</option>
				<option value="PENDING_APPROVAL">Pending Approval</option>
				<option value="RELEASED">Released</option>
				<option value="CANCELLED">Cancelled</option>
				<option value="FUTURE">Upcoming Engagement</option>
			</select>

			{value.state === "CANCELLED" && <span>
				due to <select value={value.cancelledReason} onChange={this.onChange} ref={(el) => this.cancelledReasonSelect = el}>
					<option value="">Everything</option>
					<option value="CANCELLED_BY_ADVISOR">Advisor</option>
					<option value="CANCELLED_BY_PRINCIPAL">Principal</option>
					<option value="CANCELLED_DUE_TO_TRANSPORTATION">Transportation</option>
					<option value="CANCELLED_DUE_TO_FORCE_PROTECTION">Force Protection</option>
					<option value="CANCELLED_DUE_TO_ROUTES">Routes</option>
					<option value="CANCELLED_DUE_TO_THREAT">Threat</option>
				</select>
			</span>}
		</div>
	}

	@autobind
	onChange(event) {
		let value = this.stateSelect.value
		let queryParams = {state: value}
		if (value === "CANCELLED") {
			let cancelledReason = this.cancelledReasonSelect && this.cancelledReasonSelect.value
			queryParams.cancelledReason = cancelledReason
		}

		this.props.onChange(queryParams)
	}
}
