import React, {Component} from 'react'
import autobind from 'autobind-decorator'

import DatePicker from 'react-bootstrap-date-picker'
import moment from 'moment'

export default class DateRangeSearch extends Component {
	render() {
		let {value, queryKey} = this.props

		let startKey = queryKey ? queryKey + 'Start' : 'start'
		let start = value[startKey] ? moment.unix(value[startKey] / 1000) : moment()

		return <div>
			<DatePicker value={start.toISOString()} onChange={this.onChange} showTodayButton showClearButton={false} />
		</div>
	}

	@autobind
	onChange(event) {
		let {queryKey} = this.props
		let startKey = queryKey ? queryKey + 'Start' : 'start'
		let start = moment(event).startOf('day').valueOf()
		let queryParams = {[startKey]: start}
		this.props.onChange(queryParams)
	}
}
