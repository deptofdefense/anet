import API from 'api'

class GraphQLPart {
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

GQL = {
	// Pass a variable number of GraphQLQuery to run
	run(parts) {
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
	},

	Part: GraphQLPart
}

export default GQL
