import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'

import Autocomplete from 'components/Autocomplete'
import Form from 'components/Form'
import History from 'components/History'

import API from 'api'
import {Poam} from 'models'

export default class PoamForm extends Component {
	static propTypes = {
		poam: PropTypes.object.isRequired,
		edit: PropTypes.bool,
	}

	render() {
		let {poam} = this.props

		return (
			<Form
				formFor={poam}
				onChange={this.onChange}
				onSubmit={this.onSubmit}
				submitText="Save PoAM"
				horizontal
			>

				<fieldset>
					<legend>Create a new Poam</legend>
					<Form.Field id="shortName" />
					<Form.Field id="longName" />
					<Form.Field id="responsibleOrg">
						<Autocomplete valueKey="shortName"
							placeholder="Select a responsible organization for this poam"
							url="/api/organizations/search" />
					</Form.Field>
				</fieldset>
			</Form>
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
				History.push(Poam.pathFor(poam), {success: "PoAM saved successfully"})
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}
}
