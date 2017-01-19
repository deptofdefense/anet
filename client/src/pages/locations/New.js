import React, {PropTypes} from 'react'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import History from 'components/History'
import Form from 'components/Form'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
import Leaflet from 'components/Leaflet'

import API from 'api'
import {Location} from 'models'

export default class LocationNew extends React.Component {
	static contextTypes = {
		router: PropTypes.object.isRequired
	}

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

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Location</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Create new Location', Location.pathForNew()]]} />
				<Messages success={this.state.success} error={this.state.error} />

				<Form formFor={location} onChange={this.onChange} onSubmit={this.onSubmit} horizontal submitText="Create location">
					{this.state.error && <fieldset><p>There was a problem saving this location</p><p>{this.state.error}</p></fieldset>}
					<fieldset>
						<legend>Create a new Location</legend>
						<Form.Field id="name" />
						<Form.Field type="static" id="location">
							{(Math.round(location.lat * 1000)) / 1000}, {(Math.round(location.lng * 1000)) / 1000}
						</Form.Field>
					</fieldset>

					<h3>Drag the marker below to set the location</h3>
					<Leaflet markers={markers} />

				</Form>
			</div>
		)
	}

	@autobind
	onMarkerMove(event) {
		let latLng = event.latlng;
		let loc = this.state.location;
		loc.lat = latLng.lat;
		loc.lng = latLng.lng;
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

		API.send("/api/locations/new", this.state.location, {disableSubmits: true})
			.then(location => {
				History.push({pathName:Location.pathFor(location),state:{success:"Saved Location"}})
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
