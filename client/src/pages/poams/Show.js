import React, {PropTypes} from 'react'
import Page from 'components/Page'
import ModelPage from 'components/ModelPage'

import Fieldset from 'components/Fieldset'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import LinkTo from 'components/LinkTo'
import autobind from 'autobind-decorator'

import API from 'api'
import {Poam} from 'models'
import Messages, {setMessages} from 'components/Messages'

class PoamShow extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}
	static modelName = 'PoAM'
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

				<Form static formFor={poam} horizontal>
					<Fieldset title={`PoAM ${poam.shortName}`} action={canEdit && <LinkTo poam={poam} edit button="primary">Edit</LinkTo>}>
						<Form.Field id="shortName" label="PoAM number" />
						<Form.Field id="longName" label="PoAM description" />
						{poam.responsibleOrg && poam.responsibleOrg.id && this.renderOrg()}
					</Fieldset>
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
}

export default ModelPage(PoamShow)
