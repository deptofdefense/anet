import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'

import SecurityBanner from 'components/SecurityBanner'
import Header from 'components/Header'
import Nav from 'components/Nav'

export default class App extends React.Component {
	static propTypes = {
		children: React.PropTypes.element.isRequired,
	}

	static PagePropTypes = {
		useNavigation: React.PropTypes.bool,
		navElement: React.PropTypes.element,
		fluidContainer: React.PropTypes.bool,
	}

	render() {
		let pageProps = this.props.children.type.pageProps || {}

		return (
			<div className="anet">
				<SecurityBanner location={this.props.location} />

				<Header />

				<div className={pageProps.fluidContainer ? "container-fluid" : "container"}>
					{pageProps.useNavigation === false
						? this.props.children
						: <Grid>
							<Row>
								<Col sm={3}>
									{pageProps.navElement || <Nav />}
								</Col>
								<Col sm={9}>
									{this.props.children}
								</Col>
							</Row>
						</Grid>
					}
				</div>
			</div>
		)
	}
}
