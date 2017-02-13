import Model from 'components/Model'

export default class Location extends Model {
	static resourceName = 'Location'
	static listName = 'locationList'

	static schema = {
		name: '',
		lat: null,
		lng: null
	}

	toString() {
		return this.name
	}
}
