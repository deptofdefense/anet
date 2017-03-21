import API from 'api'

export default class GQL {

	// Pass a variable number of GraphQLPart to run
	static run() {
		let parts = [...arguments]

		let query = parts.map(p => p.queryString).join(',\n')
		let variables = {}
		let variableDefs = []
		parts.forEach(part => {
			part.variables.forEach(variable => {
				variables[variable.name] = variable.value
				variableDefs.push(`$${variable.name}: ${variable.type}`)
			})
		})

		let variableDef = '(' + variableDefs.join(', ') + ')'

		return API.query(query, variables, variableDef)
	}

	static Part = class Part {

		constructor(queryString) {
			this.queryString = queryString
			this.variables = []
		}

		addVariable(varName, varType, varValue) {
			this.variables.push({
				name: varName,
				type: varType,
				value: varValue
			})
			return this
		}
	}
}

