import React, {PropTypes} from 'react'
import Page from 'components/Page'
import autobind from 'autobind-decorator'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'

import API from 'api'

export default class AdminIndex extends Page {
	static contextTypes = {
		app: PropTypes.object,
	}

	constructor(props) {
		super(props)
		this.state = {
			settings: {},
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			adminSettings(f:getAll) { key, value }
		`).then(data => {
			let settings = {}
			data.adminSettings.forEach(setting => settings[setting.key] = setting.value)
			this.setState({settings})
		})
	}

	render() {
		let {settings} = this.state

		return (
			<div>
				<Breadcrumbs items={[['Admin settings', '/admin']]} />

				<Form formFor={settings} horizontal submitText="Save settings" onChange={this.onChange} onSubmit={this.onSubmit}>
					<fieldset>
						<legend>Site Settings</legend>

						{Object.map(settings, (key, value) =>
							<Form.Field id={key} key={key} />
						)}
					</fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	onChange(event) {
		let settings = this.state.settings
		this.setState({settings})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		let json = Object.map(this.state.settings, (key, value) => ({key, value}))

        API.send('/api/admin/save', json, {disableSubmits: true})
            .then(() => {
				this.context.app.fetchData()
			})
			.catch(error => {
                this.setState({error})
                window.scrollTo(0, 0)
				console.error(error)
            })
	}

}
