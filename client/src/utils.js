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
