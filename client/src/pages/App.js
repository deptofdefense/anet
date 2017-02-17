import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Grid, Row, Col} from 'react-bootstrap'

import SecurityBanner from 'components/SecurityBanner'
import Header from 'components/Header'
import Nav from 'components/Nav'
import History from 'components/History'

import API from 'api'
import {Person, Organization} from 'models'

export default class App extends Page {
	static PagePropTypes = {
		useNavigation: PropTypes.bool,
		fluidContainer: PropTypes.bool,
	}

	static propTypes = {
		children: PropTypes.element.isRequired,
	}

	static childContextTypes = {
		app: PropTypes.object,
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
				id, name, role, emailAddress, rank, status
				position {
					id, name, type,
					organization { id, shortName , allDescendantOrgs { id }}
				}
			}

			adminSettings(f:getAll) {
				key, value
			}
			organizationList(f:getTopLevelOrgs, type: ADVISOR_ORG) {
				list { id, shortName }
			}
		`).then(data => this.setState(this.processData(data)))

	}

	processData(data) {
		let currentUser = new Person(data.person)
		let organizations = (data.organizationList && data.organizationList.list) || []
		organizations = Organization.fromArray(organizations)
		organizations.sort((a, b) => a.shortName.localeCompare(b.shortName))

		let settings = this.state.settings
		data.adminSettings.forEach(setting => settings[setting.key] = setting.value)

		if (currentUser.id && currentUser.status === 'NEW_USER') {
			History.push('/onboarding')
		}

		return {currentUser, settings, organizations}
	}

	render() {
		let pageProps = this.props.children.type.pageProps || {}

		return (
			<div className="anet">
				<SecurityBanner location={this.props.location} />

				<Header minimalHeader={pageProps.minimalHeader} />

				<Grid componentClass="section" bsClass={pageProps.fluidContainer ? 'container-fluid' : 'container'}>
					{pageProps.useNavigation === false
						? <Row><Col xs={12}>{this.props.children}</Col></Row>
						: <Row>
							<Col sm={3}>
								<Nav />
							</Col>
							<Col sm={9}>
								{this.props.children}
							</Col>
						</Row>
					}
				</Grid>
			</div>
		)
	}
}
