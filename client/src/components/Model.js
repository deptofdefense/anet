import API from 'api'
import utils from 'utils'

export default class Model {
	static schema = {}

	static fromArray(array) {
		if (!array)
			return []

		return array.map(object =>
			object instanceof this
				? object
				: new this(object)
		)
	}

	static map(array, func) {
		if (!array)
			return []

		return array.map(object =>
			object instanceof this
				? func(object)
				: func(new this(object))
		)
	}

	static pathFor(instance) {
		if (!instance && instance !== null)
			return console.error(`You didn't pass anything to ${this.name}.pathFor. If you want a new route, you can pass null.`)

		let resourceName = this.resourceName || utils.resourceize(this.name)
		let id = (instance && instance.id) || 'new'
		return ['', resourceName, id].join('/')
	}

	constructor(props) {
		Object.assign(this, this.constructor.schema, props)
	}

	setState(props) {
		Object.assign(this, props)
		return this
	}

	save(apiOptions) {
		return API.send(`/api/${this.toPath()}`, this, apiOptions)
				.then(response => {
					console.log(response);

					if (response.code) {
						this.errors = response.code
						throw response.code
					}

					return response
				})
	}

	toPath() {
		return this.constructor.pathFor(this)
	}

	toString() {
		return this.name || this.id
	}

	toJSON() {
		let json = Object.assign({}, this)
		Object.keys(json).forEach(key => {
			let value = json[key]
			if (value instanceof Model)
				json[key] = {id: value.id}

			if (Array.isArray(value)) {
				json[key] = value.map(child =>
					child instanceof Model ? {id: child.id} : child
				)
			}
		})

		return json
	}
}
