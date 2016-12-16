import React from 'react'
import {Radio, Table, Button} from 'react-bootstrap'
import {Link} from 'react-router'

import RadioGroup from '../components/RadioGroup'
import Breadcrumbs from '../components/Breadcrumbs'

import API from '../api'

const FORMAT_EXSUM = 'exsum'
const FORMAT_TABLE = 'table'

export default class Search extends React.Component {
	constructor(props) {
		super(props)
		this.state = {query: props.location.query.q, viewFormat: FORMAT_EXSUM}

		this.changeViewFormat = this.changeViewFormat.bind(this)
	}

	static useNavigation = <div>
		<Link to="/">&lt; Return to previous page</Link>

		<RadioGroup vertical size="large" style={{width: '100%'}}>
			<Radio value="all">Everything</Radio>
			<Radio value="reports">Reports</Radio>
			<Radio value="people">People</Radio>
			<Radio value="positions">Positions</Radio>
			<Radio value="locations">Locations</Radio>
			<Radio value="organizations">Organizations</Radio>
		</RadioGroup>
	</div>

	render() {
		return (
			<div>
				<Breadcrumbs items={[['Searching for "' + this.state.query + '"', '/search']]} className="pull-left" />

				<div className="pull-right">
					<RadioGroup value={this.state.viewFormat} onChange={this.changeViewFormat}>
						<Radio value={FORMAT_EXSUM}>EXSUM</Radio>
						<Radio value={FORMAT_TABLE}>Table</Radio>
					</RadioGroup>
				</div>

				{this.state.viewFormat === FORMAT_TABLE ? this.renderTable() : this.renderExsums()}
			</div>
		)
	}

	renderTable() {
		return <div></div>
	}

	renderExsums() {
		return <div></div>
	}

	changeViewFormat(newFormat) {
		this.setState({viewFormat: newFormat})
	}
}
