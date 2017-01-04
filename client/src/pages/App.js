import React from 'react'
import Page from 'components/Page'
import {Grid, Row, Col} from 'react-bootstrap'

import SecurityBanner from 'components/SecurityBanner'
import Header from 'components/Header'
import Nav from 'components/Nav'

import API from 'api'

export default class App extends Page {
	static PagePropTypes = {
		useNavigation: React.PropTypes.bool,
		navElement: React.PropTypes.element,
		fluidContainer: React.PropTypes.bool,
	}

	static propTypes = {
		children: React.PropTypes.element.isRequired,
	}

	static childContextTypes = {
		app: React.PropTypes.object,
	}

	getChildContext() {
		return {
			app: this,
		}
	}

	constructor(props) {
		super(props)
		this.state = window.ANET_DATA
	}

	fetchData() {
		API.query(/* GraphQL */`
			person(f:me) {
				id, name
				position { type }
			}

			adminSettings(f:getAll) {
				key, value
			}
			organizations(f:getTopLevelOrgs, type: ADVISOR_ORG) {
				id, name
				parentOrg { id }
			}
		`).then(data => {
			let currentUser = this.state.currentUser
			let settings = this.state.settings
			let organizations = data.organizations

			Object.assign(currentUser, data.person)
			if (data.person && data.person.position) currentUser.role = data.person.position.type

			data.adminSettings.forEach(setting => settings[setting.key] = setting.value)

			this.setState({currentUser, settings, organizations})
		})
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
