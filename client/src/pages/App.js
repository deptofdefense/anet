import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'

import SecurityBanner from '../components/SecurityBanner'
import Header from '../components/Header'
import Nav from '../components/Nav'

export default class App extends React.Component {
	render() {
		return (
			<div className="anet">
				<SecurityBanner location={this.props.location} />

				<Header />

				<div className={this.props.children.type.fluidContainer ? "container-fluid" : "container"}>
					{this.props.children.type.useNavigation === false ? this.props.children : (
						<Grid>
							<Row>
								<Col sm={3}>
									{this.props.children.type.useNavigation || <Nav />}
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
