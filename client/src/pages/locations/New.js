import React from 'react'
import autobind from 'autobind-decorator'

import Fieldset from 'components/Fieldset'
import NavigationWarning from 'components/NavigationWarning'
import History from 'components/History'
import Form from 'components/Form'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
import Leaflet from 'components/Leaflet'
import ValidatableFormWrapper from 'components/ValidatableFormWrapper'

import API from 'api'
import {Location} from 'models'

export default class LocationNew extends ValidatableFormWrapper {
	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)

		this.state = {
			location: new Location(),
			markers: [{id: 0, draggable: true, onMove: this.onMarkerMove}]
		}
	}

	render() {
		let location = this.state.location
		let markers = this.state.markers
		const {ValidatableForm, RequiredField} = this

		function Coordinate(props) {
			return <span>{Math.round(props.coord * 1000) / 1000}</span>
		}

		return (
			<div>
				<NavigationWarning original={new Location()} current={location} />

				<Breadcrumbs items={[['Create new Location', Location.pathForNew()]]} />
				<Messages success={this.state.success} error={this.state.error} />

				<ValidatableForm formFor={location} onChange={this.onChange} onSubmit={this.onSubmit} horizontal submitText="Create location">
					{this.state.error && <fieldset><p>There was a problem saving this location</p><p>{this.state.error}</p></fieldset>}

					<Fieldset title="Create a new Location">
						<RequiredField id="name" />
						<Form.Field type="static" id="location">
							<Coordinate coord={location.lat} />, <Coordinate coord={location.lng} />
						</Form.Field>
					</Fieldset>

					<h3>Drag the marker below to set the location</h3>
					<Leaflet markers={markers} />

				</ValidatableForm>
			</div>
		)
	}

	@autobind
	onMarkerMove(event) {
		let latLng = event.latlng
		let loc = this.state.location
		loc.lat = latLng.lat
		loc.lng = latLng.lng
		this.setState({location: loc})
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

		API.send('/api/locations/new', this.state.location, {disableSubmits: true})
			.then(location => {
				History.push(Location.pathFor(location), {success: 'Saved Location', skipPageLeaveWarning: true})
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
