import React from 'react'
import Page from 'components/Page'
import {Grid, Row, Col} from 'react-bootstrap'

import SecurityBanner from 'components/SecurityBanner'
import Header from 'components/Header'
import Nav from 'components/Nav'

import API from 'api'
import {Person, Organization} from 'models'

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

		this.state = {
			currentUser: {},
			settings: {},
			organizations: [],
		}

		this.state = this.processData(window.ANET_DATA)
	}

	componentWillReceiveProps() {
		// this is just to prevent App from refetching app settings on every
		// single page load. in the future we may wish to do something more
		// intelligent to refetch page settings
	}

	fetchData() {
		API.query(/* GraphQL */`
			person(f:me) {
				id, name, role
				position {
					id, name, type,
					organization { id, name }
				}
			}

			adminSettings(f:getAll) {
				key, value
			}
			organizations(f:getTopLevelOrgs, type: ADVISOR_ORG) {
				id, name
				parentOrg { id }
			}
		`).then(data => this.setState(this.processData(data)))
	}

	processData(data) {
		let currentUser = new Person(data.person)
		let organizations = Organization.fromArray(data.organizations)

		let settings = this.state.settings
		data.adminSettings.forEach(setting => settings[setting.key] = setting.value)

		return {currentUser, settings, organizations}
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
