import React from 'react'
import Page from 'components/Page'
import autobind from 'autobind-decorator'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import {ContentForHeader} from 'components/Header'
import Form from 'components/Form'
import {browserHistory as History} from 'react-router'

export default class AdminEdit extends Page {
	static contextTypes = {
		app: React.PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
		this.state = {
			setting: {
				key: props.params.key,
				value: '',
			}
		}
	}

	fetchData(props) {
		let key = props.params.key

		API.query(/* GraphQL */`
			adminSettings(f:getAll) {
				key, value
			}
		`).then(data => {
			let setting = data.adminSettings.find(setting => setting.key === key)
			this.setState({setting})
		})
	}

	render() {
		let setting = this.state.setting

		return (
			<div>
				<Breadcrumbs items={[['Admin settings', '/admin'], [setting.key, `/admin/settings/${setting.key}`]]} />

				<ContentForHeader>
					<h1>Edit settings</h1>
				</ContentForHeader>

				<Form formFor={setting} onChange={this.onChange} onSubmit={this.onSubmit} actionText="Save setting">
					<fieldset>
						<legend>{setting.key}</legend>
						<Form.Field id="value" />
					</fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	onChange(event) {
		let setting = this.state.setting
		this.setState({setting})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

        API.send('/api/admin/save', this.state.setting, {disableSubmits: true})
            .then(() => {
				History.push('/admin')
				this.context.app.fetchData()
			})
			.catch(error => {
                this.setState({error})
                window.scrollTo(0, 0)
				console.error(error)
            })
	}
}
