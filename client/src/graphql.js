import API from 'api'

export class GraphQLPart {

	constructor() {
		this.variables = []
	}

	withQueryString(queryString) {
		this.queryString = queryString
		return this
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


export class GraphQLQuery {

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

}
