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
import LocationForm from 'pages/locations/Form'

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

				<LocationForm location={location} />
			</div>
		)
	}
}
