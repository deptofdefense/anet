import * as changeCase from 'change-case'
import pluralize from 'pluralize'

export default {
	...changeCase,
	pluralize,
	resourceize: function(string) {
		return pluralize(changeCase.camel(string))
	},
	createUrlParams: function (obj) {
		let str = ''
		Object.forEach(obj, (key, val) => {
			if (str !== '') {
				str += '&'
			}
			str += key + '=' + encodeURIComponent(val)
		})
		return str
	}
}

Object.forEach = function(source, func) {
	return Object.keys(source).forEach(key => {
		func(key, source[key])
	})
}

Object.map = function(source, func) {
	return Object.keys(source).map(key => {
		let value = source[key]
		return func(key, value)
	})
}

Object.get = function(source, keypath) {
	const keys = keypath.split('.')
	while (keys[0]) {
		let key = keys.shift()
		source = source[key]
		if (typeof source === 'undefined' || source === null)
			return source
	}
	return source
}

Object.without = function(source, ...keys) {
	let copy = Object.assign({}, source)
	let i = keys.length
	while (i--) {
		let key = keys[i]
		copy[key] = undefined
		delete copy[key]
	}

	return copy
}

// eslint-disable-next-line
Promise.prototype.log = function() {
	return this.then(function(data) {
		console.log(data)
		return data
	})
}
