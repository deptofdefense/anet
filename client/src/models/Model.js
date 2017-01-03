import API from 'api'

export default class Model {
	static schema = {}

	constructor(props) {
		Object.assign(this, this.constructor.schema, props)

		this._meta = {
			resourceName: this.constructor.resourceName || (this.constructor.name.toLowerCase() + 's')
		}
	}

	setState(props) {
		Object.assign(this, props)
		return this
	}

	save(apiOptions) {
		return API.send(`/api/${this._meta.resourceName}/new`, this, apiOptions)
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
		let resourceName = this._meta.resourceName
		let id = this.id

		const path = ['']
		resourceName && path.push(resourceName)
		id && path.push(id)

		console.log(path.join('/'));
		return path.join('/')
	}

	toJSON() {
		return Object.without(this, '_meta')
	}
}
