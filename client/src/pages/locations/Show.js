import React, {PropTypes} from 'react'
import Page from 'components/Page'

import Form from 'components/Form'
import Fieldset from 'components/Fieldset'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages, {setMessages} from 'components/Messages'
import Leaflet from 'components/Leaflet'
import LinkTo from 'components/LinkTo'

import API from 'api'
import {Location} from 'models'

export default class LocationShow extends Page {
	static contextTypes = {
		currentUser: PropTypes.object.isRequired,
	}

	static modelName = 'Location'

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
		`).then(data => this.setState({location: new Location(data.location)}))
	}

	render() {
		let loc = this.state.location
		let currentUser = this.context.currentUser
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

				<Form static formFor={loc} horizontal >
					<Fieldset title={loc.name} action={currentUser.isSuperUser() && <LinkTo location={loc} edit button="primary">Edit</LinkTo>} >
						<Form.Field id="latlng" value={latlng} label="Lat/Lon" />
					</Fieldset>

					<Leaflet markers={markers}/>
				</Form>
			</div>
		)
	}
}
