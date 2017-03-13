import utils from 'utils'

export default class Model {
	static schema = {}

	static resourceName = null
	static displayName = null
	static listName = null

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

		return array.map((object, idx) =>
			object instanceof this
				? func(object, idx)
				: func(new this(object), idx)
		)
	}

	static pathFor(instance) {
		if (!instance)
			return console.error(`You didn't pass anything to ${this.name}.pathFor. If you want a new route, you can pass null.`)

		if (process.env.NODE_ENV !== 'production') {
			if (!this.resourceName)
				return console.error(`You must specify a resourceName on model ${this.name}.`)
		}

		let resourceName = utils.resourceize(this.resourceName)
		let id = instance.id
		return ['', resourceName, id].join('/')
	}

	static pathForNew() {
		let resourceName = utils.resourceize(this.resourceName)
		return ['', resourceName, 'new'].join('/')
	}

	static pathForEdit(instance) {
		return this.pathFor(instance) + '/edit'
	}

	static isEqual(a, b) {
		return a && b && a.id === b.id
	}

	constructor(props) {
		Object.forEach(this.constructor.schema, (key, value) => {
			if (Array.isArray(value) && value.length === 0) {
				this[key] = []
			} else if (value && typeof value === 'object' && Object.keys(value).length === 0) {
				this[key] = {}
			} else {
				this[key] = value
			}
		})

		if (props) {
			this.setState(props)
		}
	}

	setState(props) {
		Object.forEach(props, (key, value) => {
			if (value !== null)
				this[key] = value
		})

		return this
	}

	toPath() {
		return this.id ? this.constructor.pathFor(this) : this.constructor.pathForNew()
	}

	toString() {
		return this.name || this.id
	}
}
