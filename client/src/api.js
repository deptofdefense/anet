import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const NPROGRESS_CONTAINER = '.header'

if (process.env.NODE_ENV !== 'test') {
	NProgress.configure({
		parent: NPROGRESS_CONTAINER
	})
}

let activeRequestCount = 0

function onRequestStart() {
	activeRequestCount++
	if (activeRequestCount === 1) {
		if (document.querySelector(NPROGRESS_CONTAINER)) {
			NProgress.start()
		}
		document.body.classList.add('loading')

	}
}

function onRequestEnd() {
	activeRequestCount--
	if (!activeRequestCount) {
		NProgress.done()
		document.body.classList.remove('loading')

	}
}

const API = {
	fetch(url, params) {
		onRequestStart()
		params = params || {}
		params.credentials = 'same-origin'

		params.headers = params.headers || {}
		params.headers.Accept = 'application/json'

		let promise = window.fetch(url, params)
					.then(response => {
						let isOk = response.ok

						if (API.inProgress === promise) {
							API.inProgress = null
						}

						if (response.headers.get('content-type') === 'application/json') {
							let respBody = response.json()
							if (!isOk) {
								return respBody.then(r => {
									r.status = response.status
									r.statusText = response.statusText
									if (!r.message) { r.message = r.error || 'You do not have permissions to perform this action' }
									return Promise.reject(r)
								})
							}
							return respBody
						}

						if (!isOk) {
							if (response.status === 500) {
								response.message = 'An Error occured! Please contact the administrator and let them know what you were doing to get this error'
							}
							response = Promise.reject(response)
						}

						return response
					})
					
		promise.then(onRequestEnd, onRequestEnd)

		API.inProgress = promise
		NProgress.set(0.5)
		return promise
	},

	send(url, data, params) {
		params = params || {}
		params.disableSubmits = typeof params.disableSubmits === 'undefined' ? true : params.disableSubmits
		params.method = params.method || 'POST'
		params.body = JSON.stringify(data)

		params.headers = params.headers || {}
		params.headers['Content-Type'] = 'application/json'

		let promise = API.fetch(url, params)
		let buttons = document.querySelectorAll('[type=submit]')
		let toggleButtons =  function(onOff) {
			for (let button of buttons) {
				button.disabled = !onOff
			}
		}

		if (params.disableSubmits) {
			toggleButtons(false)

			promise.then(response => {
				toggleButtons(true)
				return response
			}, response => {
				toggleButtons(true)
				return response
			})
		}

		return promise
	},

	query(query, variables, variableDef) {
		variables = variables || {}
		variableDef = variableDef || ''
		query = 'query ' + variableDef + ' { ' + query + ' }'
		return API.send('/graphql', {query, variables}).then(json => json.data)
	},
}

export default API
