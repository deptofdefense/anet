import Model from 'components/Model'

export default class Location extends Model { 
	static schema = { 
		name: '',
		lat: null,
		lng: null
	}
}
