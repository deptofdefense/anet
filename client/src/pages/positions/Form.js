import React, {PropTypes} from 'react'
import {Button} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import ValidatableFormWrapper from 'components/ValidatableFormWrapper'
import Fieldset from 'components/Fieldset'
import Form from 'components/Form'
import Messages from 'components/Messages'
import Autocomplete from 'components/Autocomplete'
import ButtonToggleGroup from 'components/ButtonToggleGroup'
import History from 'components/History'

import API from 'api'
import {Position, Organization} from 'models'


export default class PositionForm extends ValidatableFormWrapper {
	static propTypes = {
		position: PropTypes.object.isRequired,
		edit: PropTypes.bool,
		error: PropTypes.object,
		success: PropTypes.object,
	}

	static contextTypes = {
		currentUser: PropTypes.object.isRequired,
	}

	render() {
		let {position, error, success, edit} = this.props

		error = this.props.error || (this.state && this.state.error)

		let currentUser = this.context.currentUser

		let orgSearchQuery = {}
		if (position.isPrincipal()) {
			orgSearchQuery.type = 'PRINCIPAL_ORG'
		} else {
			orgSearchQuery.type = 'ADVISOR_ORG'
			if (currentUser && currentUser.position && currentUser.position.type === 'SUPER_USER') {
				orgSearchQuery.parentOrgId = currentUser.position.organization.id
				orgSearchQuery.parentOrgRecursively = true
			}
		}

		const {ValidatableForm, RequiredField} = this

		return (
			<ValidatableForm
				formFor={position}
				onChange={this.onChange}
				onSubmit={this.onSubmit}
				submitText="Save position"
				horizontal
			>

				<Messages error={error} success={success} />

				<Fieldset title={edit ? `Edit Position ${position.name}` : "Create a new Position"}>
					<Form.Field id="type" disabled={this.props.edit}>
						<ButtonToggleGroup>
							<Button id="typeAdvisorButton" value="ADVISOR">NATO (Billet)</Button>
							<Button id="typePrincipalButton" value="PRINCIPAL">Principal (Tashkil)</Button>
						</ButtonToggleGroup>
					</Form.Field>

					<Form.Field id="status" >
						<ButtonToggleGroup>
							<Button id="statusActiveButton" value="ACTIVE">Active</Button>
							<Button id="statusInactiveButton" value="INACTIVE">Inactive</Button>
						</ButtonToggleGroup>
					</Form.Field>

					<Form.Field id="organization">
						<Autocomplete
							placeholder="Select the organization for this position"
							objectType={Organization}
							fields="id, longName, shortName"
							template={org => <span>{org.shortName} - {org.longName}</span>}
							queryParams={orgSearchQuery}
							valueKey="shortName"
						/>
					</Form.Field>

					<Form.Field id="code"
						label={position.type === 'PRINCIPAL' ? 'Tashkil Code' : 'Billet Code'}
						placeholder="Postion ID or Number" />

					<RequiredField id="name" label="Position Name" placeholder="Name/Description of Position"/>

					{position.type !== 'PRINCIPAL' &&
						<Form.Field id="permissions">
							<ButtonToggleGroup>
								<Button id="permsAdvisorButton" value="ADVISOR">User</Button>
								<Button id="permsSuperUserButton" value="SUPER_USER">Super User</Button>
								{currentUser && currentUser.isAdmin() &&
									<Button id="permsAdminButton" value="ADMINISTRATOR">Administrator</Button>
								}
							</ButtonToggleGroup>
						</Form.Field>
					}

				</Fieldset>

				<Fieldset title="Additional information">
					<Form.Field id="location">
						<Autocomplete valueKey="name" placeholder="Start typing to find a location where this Position will operate from..." url="/api/locations/search" />
					</Form.Field>
				</Fieldset>
			</ValidatableForm>
		)
	}


	@autobind
	onChange() {
		this.forceUpdate()
	}

	@autobind
	onSubmit(event) {
		let {position, edit} = this.props
		position = Object.assign({}, position)

		if (position.type !== 'PRINCIPAL') {
			position.type = position.permissions || 'ADVISOR'
		}
		delete position.permissions
		position.organization = {id: position.organization.id}
		position.person = (position.person && position.person.id) ? {id: position.person.id} : {}
		position.code = position.code || null //Need to null out empty position codes

		let url = `/api/positions/${edit ? 'update' : 'new'}`
		API.send(url, position, {disableSubmits: true})
			.then(response => {
				if (response.id) {
					position.id = response.id
				}

				History.replace(Position.pathForEdit(position), false)
				History.push(Position.pathFor(position), {success: 'Saved Position', skipPageLeaveWarning: true})
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}
}
