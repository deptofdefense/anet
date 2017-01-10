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
		if (!instance)
			return console.error(`You didn't pass anything to ${this.name}.pathFor. If you want a new route, you can pass null.`)

		let resourceName = this.resourceName || utils.resourceize(this.name)
		let id = instance.id
		return ['', resourceName, id].join('/')
	}

	static pathForNew() {
		let resourceName = this.resourceName || utils.resourceize(this.name)
		return ['', resourceName, 'new'].join('/')
	}

	static isEqual(a, b) {
		return a && b && a.id === b.id
	}

	constructor(props) {
		Object.assign(this, this.constructor.schema)
		if (props)
			this.setState(props)
	}

	setState(props) {
		Object.forEach(props, (key, value) => {
			if (value !== null)
				this[key] = value
		})

		return this
	}

	toPath() {
		return (this.id) ? this.constructor.pathFor(this) : this.constructor.pathForNew()
	}

	toString() {
		return this.name || this.id
	}

	toJSON() {
		let json = Object.assign({}, this)
		Object.keys(json).forEach(key => {
			let value = json[key]
			if (value instanceof Model)
				value
//				json[key] = {id: value.id}

			if (Array.isArray(value)) {
				json[key] = value.map(child =>
//					child instanceof Model ? {id: child.id} : child
					child
				)
			}
		})

		return json
	}
}
