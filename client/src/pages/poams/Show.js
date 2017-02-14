import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {DropdownButton, MenuItem} from 'react-bootstrap'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import LinkTo from 'components/LinkTo'
import autobind from 'autobind-decorator'
import History from 'components/History'

import API from 'api'
import {Poam} from 'models'
import Messages, {setMessages} from 'components/Messages'

export default class PoamShow extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
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
		setMessages(props,this.state)
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			poam(id:${props.params.id}) {
				id,
				shortName,
				longName,
				responsibleOrg {id, shortName, longName}
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
		// Admins can edit poams, or super users if this poam is assigned to their org.
		let currentUser = this.context.app.state.currentUser
		let canEdit = (currentUser && currentUser.isAdmin()) ||
			(currentUser && poam.responsibleOrg && currentUser.isSuperUserForOrg(poam.responsibleOrg))

		return (
			<div>
				<Breadcrumbs items={[[`PoAM ${poam.shortName}`, Poam.pathFor(poam)]]} />
				<Messages success={this.state.success} error={this.state.error} />

				{canEdit &&
					<div className="pull-right">
						<DropdownButton bsStyle="primary" title="Actions" id="actions" className="pull-right" onSelect={this.actionSelect}>
							{canEdit && <MenuItem eventKey="edit" >Edit {poam.shortName}</MenuItem>}
						</DropdownButton>
					</div>
				}

				<Form static formFor={poam} horizontal>
					<fieldset>
						<legend>PoAM {poam.shortName}</legend>
						<Form.Field id="shortName" />
						<Form.Field id="longName" />
						{ poam.responsibleOrg && poam.responsibleOrg.id && this.renderOrg()}
					</fieldset>
				</Form>
			</div>
		)
	}

    @autobind
    renderOrg() {
		let responsibleOrg = this.state.poam.responsibleOrg
		return (
			<Form.Field id="responsibleOrg" label="Responsible Organization" >
				<LinkTo organization={responsibleOrg}>
					{responsibleOrg.shortName} {responsibleOrg.longName}
				</LinkTo>
			</Form.Field>
		)
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === 'edit') {
			History.push(Poam.pathForEdit(this.state.poam))
		} else {
			console.log('Unimplemented Action: ' + eventKey)
		}
	}
}
