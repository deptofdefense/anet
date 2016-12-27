import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
	parent: '.header'
})

const API = {
	fetch(url, params) {
		params = params || {}
		params.credentials = 'same-origin'

		params.headers = params.headers || {}
		params.headers['Accept'] = 'application/json'

		if (params.showLoader !== false)
			API.startLoading()
		delete params.showLoader

		return window.fetch(url, params)
					.then(response => response.json())
					.then(response => {
						API.stopLoading()
						return response
					})
	},

	send(url, data, params) {
		params = params || {}
		params.method = params.method || 'POST'
		params.body = JSON.stringify(data)

		params.headers = params.headers || {}
		params.headers['Content-Type'] = 'application/json'

		if (params.disableSubmits) {
			let buttons = document.querySelectorAll('form [type=submit]')
			for (var button of buttons) {
				button.disabled = true
			}
		}

		return API.fetch(url, params)
	},

	query(query, variables) {
		query = 'query { ' + query + ' }'
		variables = variables || {}
		return API.send('/graphql', {query, variables}).then(json => json.data)
	},

	startLoading() {
		NProgress.start()
		NProgress.set(0.5)
	},

	stopLoading() {
		NProgress.done()
	},
}

export default API
