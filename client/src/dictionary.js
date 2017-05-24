

function Dictionary() {
	this._dictionary = {}

	this.lookup = function(key, scope = {}) {
		let dictEntry = this._dictionary[key] || ""

		//Replace each replacement key based on the 'with' object.
		Object.keys(scope).forEach(key =>
			dictEntry = dictEntry.replace('%{' + key + '}', scope[key])
		)

		return dictEntry
	}

	this.setDictionary = function(newDict) {
		this._dictionary = newDict
	}

}

let instance = new Dictionary()

export default instance
