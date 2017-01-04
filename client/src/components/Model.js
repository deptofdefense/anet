import API from 'api'
import utils from 'utils'

export default class Model {
	static schema = {}

	static fromArray(array) {
		return array.map(object =>
			object instanceof this
				? object
				: new this(object)
		)
	}

	static map(array, func) {
		return this.fromArray(array).map(func)
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

					this.setState(response)
					return this
				})
	}

	toPath() {
		return this.constructor.pathFor(this)
	}

	toString() {
		return this.toPath()
	}
}
