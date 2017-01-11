import React from 'react'
import Page from 'components/Page'
import {DropdownButton, MenuItem} from 'react-bootstrap'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import LinkTo from 'components/LinkTo'
import autobind from 'autobind-decorator'

import API from 'api'
import {Poam} from 'models'

export default class PoamShow extends Page {
	static contextTypes = {
		app: React.PropTypes.object.isRequired,
	}
	constructor(props) {
		super(props)
		this.state = {
			poam: new Poam({
				id: props.params.id,
				shortName: props.params.shorName,
				longName: props.params.longName,
				responsibleOrg: props.params.responsibleOrg
			}),
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			poam(id:${props.params.id}) {
				id,
				shortName,
				longName,
				responsibleOrg {id,name}
			}
		`).then(data => {
            this.setState({
                poam: new Poam(data.poam)
            })
        }
        )
	}

	render() {
		let {poam} = this.state
		// Super Users/Admins can edit Poams. Perhaps users of the responsible org can edit? TODO
		let currentUser = this.context.app.state.currentUser
		let canEdit = currentUser && currentUser.isSuperUser()
		return (
			<div>
				<Breadcrumbs items={[[poam.shortName, Poam.pathFor(poam)]]} />
				<div className="pull-right">
					<DropdownButton bsStyle="primary" title="Actions" id="actions" className="pull-right" onSelect={this.actionSelect}>
						{canEdit && <MenuItem eventKey="edit" className="todo">Edit {poam.shortName}</MenuItem>}
					</DropdownButton>
				</div>
				<Form static formFor={poam} horizontal>
					<fieldset>
						<legend>{poam.longName}</legend>
						<Form.Field id="shortName" />
						<Form.Field id="longName" />
						{ poam.responsibleOrg && poam.responsibleOrg !=={} && this.renderOrg()}
					</fieldset>
				</Form>
			</div>
		)
	}

    @autobind
    renderOrg() {
		let responsibleOrg = this.state.poam.responsibleOrg
		return (
			<Form static formFor={responsibleOrg} horizontal>
			<fieldset>
				<legend>
					Responsible Organization
				</legend>
				<Form.Field id="name"><LinkTo organization={responsibleOrg} /></Form.Field>
			</fieldset>
			</Form>
		)
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === "edit") {
			History.push(`/poams/${this.state.poam.id}/edit`);
		} else {
			console.log("Unimplemented Action: " + eventKey);
		}
	}
}
