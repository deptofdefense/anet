import React, {Component} from 'react'

import L from 'leaflet'
import autobind from 'autobind-decorator'

const css = {
	height: "500px"
}

export default class Leaflet extends Component {
	static propTypes = {

	}
	static contextTypes = {
		app: React.PropTypes.object.isRequired
	}

	constructor(props) {
		super(props)

		this.state = {
			map: null,
			center: null,
			layerControl: null,
			hasLayers: false
		}
	}

	componentDidMount() {
		let app = this.context.app;
		let mapLayers = app.state.settings["MAP_LAYERS"];
		console.log(mapLayers);

		let map = L.map('map', {zoomControl:true}).setView([35, -75], 10);
/*		let nexrad = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
		    layers: 'nexrad-n0r-900913',
		    format: 'image/png',
		    transparent: true,
		    attribution: "Weather data © 2012 IEM Nexrad"
		});
		let nmra = L.tileLayer.wms("https://mrdata.usgs.gov/services/nmra", {
			layers: 'USNationalMineralAssessment1998',
			format: 'image/png',
			transparent: true
		})

		let osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

		let baseLayers = { "Nexrad" : nexrad, "NMRA" : nmra, "OSM" : osm}
*/
		let layerControl = L.control.layers({}, {});
		layerControl.addTo(map);

		map.on('moveend', this.moveEnd);

		let state = this.state;
		state.map = map;
		state.layerControl = layerControl;
		this.setState(state);
	}

	componentWillUpdate() {
		if (this.state.hasLayers === false) {
			this.addLayers();
		}
	}

	@autobind
	addLayers() {
		let app = this.context.app
		let rawLayers = app.state.settings["MAP_LAYERS"]
		if (!rawLayers || rawLayers.length === 0) {
			this.setState({hasLayers:true});
			return
		}

		let mapLayers = JSON.parse(rawLayers)
		console.log("adding layers")
		console.log(mapLayers)

		mapLayers.forEach(l => {
			if (l.type === "wms") {
				let layer = L.tileLayer.wms(l.url, {
					layers: l.layer,
					format: l.format || 'image/png'
				})
				this.state.layerControl.addBaseLayer(layer, l.name)
			} else if (l.type === "osm") {
				let layer = L.tileLayer(l.url)
				this.state.layerControl.addBaseLayer(layer, l.name)
			}
		})


		let state = this.state
		state.hasLayers = (mapLayers.length > 0)
		this.setState(state)
	}

	render() {
		return (
			<div>
				<div id="map" style={css} />
				<span>{this.state.center}</span>
			</div>
		)
	}

	@autobind
	moveEnd(event) {
		let map = this.state.map;
		let center = map.getCenter()
		console.log(map.getCenter())

		this.setState({map, center: [center.lat, center.lng].join(',')})
	}

}
