import React, {Component} from 'react'
import autobind from 'autobind-decorator'

import DatePicker from 'react-bootstrap-date-picker'
import moment from 'moment'

export default class DateRangeSearch extends Component {

	constructor(props) {
		super(props)

		let {value} = props

		this.state = {
			value: {
				start: value.start ? value.start : null,
				end: value.end ? value.end : null,
			}
		}

		this.updateFilter()
	}

	render() {
		let {value} = this.state
		return <div>
			<DatePicker value={value.start} onChange={this.onChangeStart} showTodayButton showClearButton={false} /> to
			<DatePicker value={value.end} onChange={this.onChangeEnd} showTodayButton showClearButton={false} />
		</div>
	}

	@autobind
	onChangeStart(newDate) {
		let {value} = this.state
		value.start = newDate
		this.setState({value}, this.updateFilter)
	}

	@autobind
	onChangeEnd(newDate) {
		let {value} = this.state
		value.end = newDate
		this.setState({value}, this.updateFilter)
	}

	@autobind
	toQuery() {
		let {queryKey} = this.props
		let {value} = this.state
		let startKey = queryKey ? queryKey + 'Start' : 'start'
		let endKey = queryKey ? queryKey + 'End' : 'end'

		return {
			[startKey]: moment(value.start).valueOf(),
			[endKey]: moment(value.end).valueOf(),
		}
	}

	@autobind
	updateFilter() {
		let value = this.state.value
		value.toQuery = this.toQuery
		this.props.onChange(value)
	}
}
