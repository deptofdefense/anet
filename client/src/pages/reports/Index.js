import React from 'react'
import API from '../../api'

export default class ReportsIndex extends React.Component {
	constructor(props) {
		super(props)
		this.state = {reports: []}
	}

	componentDidMount() {
		API.fetch('/reports/1')
			.then(data => this.setState({reports: data}))
	}

	render() {
		return (
			<div>
				{this.state.reports.state}
			</div>
		)
	}
}
