import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'

import SecurityBanner from '../components/SecurityBanner'
import Header from '../components/Header'
import Nav from '../components/Nav'

export default class App extends React.Component {
	render() {
		return (
			<div className="anet">
				<SecurityBanner />

				<Header />

				<div className="container">
					{this.props.children.type.useNavigation === false ? (
						<Col xs={12}>
							{this.props.children}
						</Col>
					) : (
						<Grid>
							<Row>
								<Col sm={3}>
									<Nav />
								</Col>
								<Col sm={9}>
									{this.props.children}
								</Col>
							</Row>
						</Grid>
					)}
				</div>
			</div>
		)
	}
}
