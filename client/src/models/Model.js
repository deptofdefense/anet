import API from 'api'

export default class Model {
	static schema = {}

	static fromArray(array) {
		return array.map(object => new this(object))
	}

	constructor(props) {
		Object.assign(this, this.constructor.schema, props)
		this.constructor.resourceName = this.constructor.resourceName || (this.constructor.name.toLowerCase() + 's')
	}

	setState(props) {
		Object.assign(this, props)
		return this
	}

	save(apiOptions) {
		return API.send(`/api/${this.constructor.resourceName}/new`, this, apiOptions)
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
		let resourceName = this.constructor.resourceName
		let id = this.id

		const path = ['']
		resourceName && path.push(resourceName)
		id && path.push(id)

		return path.join('/')
	}

	toString() {
		return this.toPath()
	}
}
