import React from 'react'
import Page from 'components/Page'
import autobind from 'autobind-decorator'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'

export default class AdminIndex extends Page {
	static contextTypes = {
		app: React.PropTypes.object,
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

				<Form formFor={settings} horizontal onChange={this.onChange} onSubmit={this.onSubmit}>
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
		this.context.app.setState({settings})
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
