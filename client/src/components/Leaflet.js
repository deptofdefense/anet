import React, {Component} from 'react'

import L from 'leaflet'
import autobind from 'autobind-decorator'

const css = {
	height: "500px"
}

export default class Leaflet extends Component {
	static propTypes = {
		markers: React.PropTypes.array,
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
			markerLayer: null,
			hasLayers: false
		}

		this.icon = L.icon({
			iconUrl:       '/assets/img/leaflet/marker-icon.png',
			iconRetinaUrl: '/assets/img/leaflet/marker-icon-2x.png',
			shadowUrl:     '/assets/img/leaflet/marker-shadow.png',
			iconSize:    [25, 41],
			iconAnchor:  [12, 41],
			popupAnchor: [1, -34],
			tooltipAnchor: [16, -28],
			shadowSize: [41, 41]
		});
	}

	componentDidMount() {
		let app = this.context.app;
		let mapLayers = app.state.settings["MAP_LAYERS"];
		console.log(mapLayers);

		let map = L.map('map', {zoomControl:true}).setView([34.52, 69.16], 10);
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

		this.tryAddLayers()
		this.updateMarkerLayer(this.props.markers)
	}

	@autobind
	tryAddLayers() {
		if (this.state.hasLayers === false) {
			this.addLayers();
		}
	}

	componentWillUnmount() {
		this.setState({hasLayers:false})
	}

	componentWillReceiveProps(nextProps) {
		this.tryAddLayers()
		this.updateMarkerLayer(nextProps.markers)
	}

	@autobind
	updateMarkerLayer(markers) {
		markers = markers || [];

		let newMarkers = []
		this.props.markers.forEach(m => {
			console.log("adding", m)
			let latLng = [m.lat, m.lng]
			let marker = L.marker(latLng, {icon: this.icon})
				.bindPopup(m.name)
			newMarkers.push(marker);
		})

		let newMarkerLayer = L.featureGroup(newMarkers)

		if (this.state.markerLayer) {
			this.state.map.removeLayer(this.state.markerLayer)
		}
		if (newMarkers.length > 0) {
			newMarkerLayer.addTo(this.state.map)
			this.state.map.fitBounds(newMarkerLayer.getBounds(), {maxZoom: 15});
		}

		this.setState({markerLayer: newMarkerLayer})
	}

	@autobind
	addLayers() {
		let app = this.context.app
		let rawLayers = app.state.settings["MAP_LAYERS"]
		if (!rawLayers || rawLayers.length === 0) {
			return
		}

		let mapLayers = JSON.parse(rawLayers)

		let defaultLayer = null
		mapLayers.forEach(l => {
			let layer = null;
			if (l.type === "wms") {
				layer = L.tileLayer.wms(l.url, {
					layers: l.layer,
					format: l.format || 'image/png'
				})
			} else if (l.type === "osm") {
				layer = L.tileLayer(l.url)
			}

			if (layer) {
				this.state.layerControl.addBaseLayer(layer, l.name)
			}
			if (l.default) { defaultLayer = layer;  }
		})
		if (defaultLayer) { this.state.map.addLayer(defaultLayer); }
		this.setState({hasLayers:true});
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
