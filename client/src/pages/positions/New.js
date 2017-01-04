import React from 'react'
import Page from 'components/Page'
import {InputGroup, Button} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import DatePicker from 'react-bootstrap-date-picker'

import {ContentForHeader} from 'components/Header'
import Form from 'components/Form'
import Breadcrumbs from 'components/Breadcrumbs'
import TextEditor from 'components/TextEditor'
import Autocomplete from 'components/Autocomplete'
import {browserHistory as History} from 'react-router'

import API from 'api'

export default class PositionNew extends Page {
	static contextTypes = {
		router: React.PropTypes.object.isRequired
	}

	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)

		this.state = {
			position: {
				name: '',
				code: '',
				type: 'PRINCIPAL',
				organization: {},
				person: {},
				assignedPositions: {},
				location: {}
			}
		}
	}

	fetchData(props) { 
		API.query( /*GraphQL */`
			organization(id:${props.location.query["organizationId"]}) { 
				id, name, type
			}
		`).then(data => {
			let posType = (data.organization.type === "ADVISOR_ORG") ? "ADVISOR" : "PRINCIPAL";
			this.setState( {position : {
				name: '',
				code: '',
				type: posType,
				organization: data.organization,
				person: {},
				assignedPositions: {},
				location: {}
			}});
		})
	}

	render() {
		let position = this.state.position

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Position</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Create new Position', '/positions/new']]} />

				<Form formFor={position} onChange={this.onChange} onSubmit={this.onSubmit} horizontal>
					{this.state.error && <fieldset><p>There was a problem saving this position</p><p>{this.state.error}</p></fieldset>}
					<fieldset>
						<legend>Create a new Position</legend>
						{ position.organization && position.organization.type === "PRINCIPAL_ORG" && 
							<Form.Field type="static" value="Afghan Principal" label="Type" id="type" /> }
						{ position.organization && position.organization.type === "ADVISOR_ORG" && 
							<Form.Field id="type" componentClass="select">
								<option value="ADVISOR">Advisor</option>
								<option value="SUPER_USER">Super User</option>
								<option value="ADMINISTRATOR">Administrator</option>
							</Form.Field>
						}
						<Form.Field id="code" />
						<Form.Field id="name" />
						
						<Form.Field type="static" value={position.organization.name} label="Organization" id="org" />
					</fieldset>


					<fieldset>
						<legend>Additional Information</legend>
						
						<Form.Field id="location">
							<Autocomplete valueKey="name" placeholder="Position Location" url="/api/locations/search" /> 
						</Form.Field>
					</fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	onChange() {
		let position = this.state.position
		this.setState({position})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		let position = Object.without(this.state.position, "assignedPositions");


		API.send('/api/positions/new', position, {disableSubmits: true})
			.then(position => {
				History.push("/positions/" + position.id);
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
