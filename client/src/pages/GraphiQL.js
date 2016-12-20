import React from 'react'

import GraphiQL from 'graphiql'
import 'graphiql/graphiql.css'

export default class extends React.Component {
	static useNavigation = false

	fetch(params) {
		return fetch('/graphql', {
			credentials: 'same-origin',
			method: 'POST',
			headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
			body: JSON.stringify(params),
		}).then(response => response.json())
	}

	render() {
		return <GraphiQL fetcher={this.fetch} />
	}
}
