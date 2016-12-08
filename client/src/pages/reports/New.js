import React from 'react'
import {Form, FormGroup, FormControl, Col} from 'react-bootstrap'

import Breadcrumbs from '../../components/Breadcrumbs'

export default class ReportNew extends React.Component {
	render() {
		return (
			<div>
				<Breadcrumbs items={[['EF4', '/organizations/ef4'], ['Submit a report', '/reports/new']]} />

				<Form horizontal>
					<FormGroup>
						<Col sm={2}>
							Engagement date
						</Col>
						<Col sm={10}>
							<FormControl />
						</Col>
					</FormGroup>
				</Form>
			</div>
		)
	}
}
