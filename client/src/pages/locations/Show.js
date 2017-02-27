import React from 'react'
import Page from 'components/Page'

import API from 'api'
import {Location} from 'models'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import Messages, {setMessages} from 'components/Messages'
import Leaflet from 'components/Leaflet'
import NotFound from 'components/NotFound'

export default class LocationShow extends Page {
	constructor(props) {
		super(props)
		this.state = {
			location: new Location()
		}
		setMessages(props,this.state)
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			location(id:${props.params.id}) {
				id, name, lat, lng
			}
			
		`).then(data => {
			LocationShow.pageProps = {useGrid: Boolean(data.location)}
			this.setState({
				location: data.location ? new Location(data.location) : null
			})
		}, err => {
			if (err.errors[0] === 'Invalid Syntax') {
				LocationShow.pageProps = {useGrid: false}
				this.setState({location: null})
			}
		})
	}

	render() {
		let loc = this.state.location

		if (!loc) {
			return <NotFound notFoundText={`No location with ID ${this.props.params.id} found.`} />
		}

		let markers=[]
		let latlng = 'None'
		if (loc.lat && loc.lng) {
			latlng = loc.lat + ', ' + loc.lng
			markers.push({name: loc.name, lat: loc.lat, lng: loc.lng})
		}



		return (
			<div>
				<Breadcrumbs items={[[loc.name || 'Location', Location.pathFor(loc)]]} />

				<Messages success={this.state.success} error={this.state.error} />

				<Form static formFor={loc} horizontal>
					<fieldset>
						<legend>{loc.name}</legend>

						<Form.Field id="latlng" value={latlng} label="Lat/Lon" />
					</fieldset>

					<Leaflet markers={markers}/>

			</Form>
			</div>
		)
	}
}
