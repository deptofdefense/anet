const methods = {
	fetch(url, params) {
		params = params || {}
		params.credentials = 'same-origin'

		params.headers = params.headers || {}
		params.headers['Accept'] = 'application/json'

		return window.fetch(url, params).then(response => response.json())
	},

	send(url, data, params) {
		params = params || {}
		params.method = params.method || 'POST'
		params.body = JSON.stringify(data)

		params.headers = params.headers || {}
		params.headers['Content-Type'] = 'application/json'

		return methods.fetch(url, params)
	},

	query(query, variables) {
		query = 'query { ' + query + ' }'
		variables = variables || {}
		return methods.send('/graphql', {query, variables}).then(json => json.data)
	}
}

export default methods

Promise.prototype.log = function() {
	return this.then(function(data) {
		console.log(data)
		return data
	})
}
