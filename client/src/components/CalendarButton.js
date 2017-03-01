import React, {Component} from 'react'
import {Button} from 'react-bootstrap'
import DatePicker from 'react-bootstrap-date-picker'
import autobind from 'autobind-decorator'

import CALENDAR_ICON from 'resources/calendar.png'

export default class CalendarButton extends Component {
	render() {
		let {onChange, ...props} = this.props

		return <Button onClick={this.onClick} {...props}>
			<img src={CALENDAR_ICON} height={20} alt="Pick a date" />
			<DatePicker ref="datePicker" style={{display: 'none'}} showTodayButton onChange={onChange} />
		</Button>
	}

	@autobind
	onClick() {
		this.refs.datePicker.handleFocus()
	}
}
