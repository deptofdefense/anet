import React from 'react'
import Page from 'components/Page'
import {Button} from 'react-bootstrap'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import autobind from 'autobind-decorator'

export default class AdminEdit extends Page {
	constructor(props) {
		super(props)
		this.state = {
			key: "",
			value: ""
		}
	}

	fetchData(props) {
		let key = props.location.query["key"]
		API.query(/* GraphQL */`
			adminSettings(f:getAll) { key, value }
		`).then(data => {
			let setting = data.adminSettings.find(s =>
				s.key === key
			);
			this.setState(setting);
		})
	}

	render() {
		let state = this.state
		let breadcrumbName = 'Edit Admin Settings'
		let breadcrumbUrl = '/admin/edit'
		return (
			<div>
				<Breadcrumbs items={[[breadcrumbName, breadcrumbUrl]]} />

				<Form onSubmit={this.onSubmit} formFor={state} onChange={this.onChange} >
					<fieldset>
						<legend>{state.key}</legend>

						<Form.Field id="value" value={state.value} />	
						<Button bsStyle="primary" type="submit" onClick={this.onSubmit} className="pull-right" >
							Save Setting
						</Button>
					</fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

        API.send('/api/admin/save', this.state, {disableSubmits: true})
            .then(response =>  {this.context.router.push('/admin/') }
            ).catch(error => {
                this.setState({error: error})
                window.scrollTo(0, 0)
            })
	

	}

	@autobind
	onChange(event) {
		let state = this.state;
		this.setState(state);
	}
		

}
