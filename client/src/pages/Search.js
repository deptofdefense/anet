import React from 'react'
import {Radio} from 'react-bootstrap'

import RadioGroup from '../components/RadioGroup'
import Breadcrumbs from '../components/Breadcrumbs'

export default class Search extends React.Component {
	constructor(props) {
		super(props)
		this.state = {query: props.location.query.q}
	}

	render() {
		return (
			<div>
				<Breadcrumbs items={[['Searching for "' + this.state.query + '"', '/search']]} className="pull-left" />

				<div className="pull-right">
					<RadioGroup onChange={this.changeViewFormat}>
						<Radio value="exsum">EXSUM</Radio>
						<Radio value="table">Table</Radio>
					</RadioGroup>
				</div>
			</div>
		)
	}
}
