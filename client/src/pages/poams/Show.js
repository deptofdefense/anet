import React from 'react'
import Page from 'components/Page'
import {Table} from 'react-bootstrap'
import moment from 'moment'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import ReportTable from 'components/ReportTable'
import LinkTo from 'components/LinkTo'
import autobind from 'autobind-decorator'

import API from 'api'
import {Poam} from 'models'

export default class PoamShow extends Page {
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
		return (
			<div>
				<Breadcrumbs items={[[poam.shortName, Poam.pathFor(poam)]]} />
				<Form static formFor={poam} horizontal>
					<fieldset>
						<legend>{poam.rank} {poam.longName}</legend>
						<Form.Field id="shortName" />
						<Form.Field id="longName" />
						{ poam.responsibleOrg && poam.responsibleOrg !={} && this.renderOrg()}
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
				<Form.Field id="name"><LinkTo organization={responsibleOrg}/></Form.Field>
			</fieldset>
			</Form>
		)
	}
}
