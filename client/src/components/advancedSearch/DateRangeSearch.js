import React, {Component} from 'react'
import autobind from 'autobind-decorator'

import DatePicker from 'react-bootstrap-date-picker'
import moment from 'moment'

export default class DateRangeSearch extends Component {

	constructor(props) {
		super(props)

		let {value, queryKey} = props
		let startKey = queryKey ? queryKey + 'Start' : 'start'
		let endKey = queryKey ? queryKey + 'End' : 'end'

		this.start = value[startKey] ? moment.unix(value[startKey] / 1000).toISOString() : null
		this.end = value[endKey] ? moment.unix(value[endKey] / 1000).toISOString() : null
	}

	render() {

		return <div>
			<DatePicker value={this.start} onChange={this.onChangeStart} showTodayButton showClearButton={false} /> to
			<DatePicker value={this.end} onChange={this.onChangeEnd} showTodayButton showClearButton={false} />
		</div>
	}

	@autobind
	onChangeStart(event) {
		console.log(event)
		this.start = event

		this.updateQuery()
	}

	@autobind
	onChangeEnd(event) {
		this.end = event
		this.updateQuery()
	}

	@autobind
	updateQuery() {
		let {queryKey} = this.props
		let startKey = queryKey ? queryKey + 'Start' : 'start'
		let endKey = queryKey ? queryKey + 'End' : 'end'

		let start = this.start && moment(this.start).startOf('day').valueOf() + 1
		let end = this.end && moment(this.end).endOf('day').valueOf() - 1
		let queryParams = {[startKey]: start, [endKey]: end}
		this.props.onChange(queryParams)
	}
}
