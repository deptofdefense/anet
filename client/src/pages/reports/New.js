import React, {PropTypes} from 'react'
import Page from 'components/Page'

import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportForm from 'components/ReportForm'

import {Report} from 'models'

export default class ReportNew extends Page {
	static pageProps = {
		useNavigation: false
	}

	static contextTypes = {
		app: PropTypes.object,
	}

	constructor(props, context) {
		super(props)

		this.state = {
			report: new Report(),
		}
	}

	componentWillReceiveProps() {
		if (this.props.addMyself)
			this.addMyself()
	}

	render() {
		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Submit a report', Report.pathForNew()]]} />

				<ReportForm addMyself report={this.state.report} />
			</div>
		)
	}
}
