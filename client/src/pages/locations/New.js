import React from 'react'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import History from 'components/History'
import Form from 'components/Form'
import Breadcrumbs from 'components/Breadcrumbs'

import API from 'api'
import {Location} from 'models'

export default class LocationNew extends React.Component {
	static contextTypes = {
		router: React.PropTypes.object.isRequired
	}

	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)

		this.state = {
			location: new Location(),
		}
	}

	render() {
		let location = this.state.location

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Location</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Create new Location', Location.pathForNew()]]} />

				<Form formFor={location} onChange={this.onChange} onSubmit={this.onSubmit} horizontal actionText="Create location">
					{this.state.error && <fieldset><p>There was a problem saving this location</p><p>{this.state.error}</p></fieldset>}
					<fieldset>
						<legend>Create a new Location</legend>
						<Form.Field id="name" />
					</fieldset>

					<div className="todo">
						Map here to pick lat/lng
					</div>
				</Form>
			</div>
		)
	}

	@autobind
	onChange() {
		let location = this.state.location
		this.setState({location})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		this.state.location.save().then(location => {
			History.push(Location.pathFor(location))
		}).catch(error => {
			this.setState({error: error})
			window.scrollTo(0, 0)
		})
	}

}
