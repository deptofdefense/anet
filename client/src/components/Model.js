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
		const {__meta, ...schema} = this.constructor.schema
		if (__meta) {
			this.constructor.__meta = __meta
			this.constructor.schema.__meta = undefined
		}

		Object.assign(this, schema)
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
				json[key] = value.toChildJSON()

			if (Array.isArray(value)) {
				json[key] = value.map(child =>
					child instanceof Model ? child.toChildJSON() : child
				)
			}
		})

		return json
	}

	toChildJSON() {
		let json = {id: this.id}

		if (this.constructor.__meta) {
			const childKeys = this.constructor.__meta.childJSONKeys
			childKeys && childKeys.forEach(key => {
				json[key] = this[key]
			})
		}

		return json
	}
}

export function includeAsChild(schema, key) {
	schema.__meta = schema.__meta || {}
	schema.__meta.childJSONKeys = schema.__meta.childJSONKeys || []
	schema.__meta.childJSONKeys.push(key)
}
