import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'

import ValidatableFormWrapper from 'components/ValidatableFormWrapper'
import Fieldset from 'components/Fieldset'
import Autocomplete from 'components/Autocomplete'
import Form from 'components/Form'
import History from 'components/History'

import API from 'api'
import {Poam} from 'models'

export default class PoamForm extends ValidatableFormWrapper {
	static propTypes = {
		poam: PropTypes.object.isRequired,
		edit: PropTypes.bool,
	}

	render() {
		let {poam, edit} = this.props
		const {ValidatableForm, RequiredField} = this

		return (
			<ValidatableForm
				formFor={poam}
				onChange={this.onChange}
				onSubmit={this.onSubmit}
				submitText="Save PoAM"
				horizontal>

				<Fieldset title={edit ? `Edit PoAM ${poam.shortName}` : "Create a new PoAM"}>
					<RequiredField id="shortName" label="PoAM number" />
					<RequiredField id="longName" label="PoAM description" />
					<Form.Field id="responsibleOrg" label="Responsible organization">
						<Autocomplete valueKey="shortName"
							placeholder="Select a responsible organization for this poam"
							url="/api/organizations/search" />
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
		let {poam, edit} = this.props

		let url = `/api/poams/${edit ? 'update' : 'new'}`
		API.send(url, poam, {disableSubmits: true})
			.then(response => {
				if (response.code) {
					throw response.code
				}

				if (response.id) {
					poam.id = response.id
				}

				History.replace(Poam.pathForEdit(poam), false)
				History.push(Poam.pathFor(poam), {success: 'PoAM saved successfully', skipPageLeaveWarning: true})
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}
}
