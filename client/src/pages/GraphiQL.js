import React, {Component} from 'react'

import GraphiQL from 'graphiql'
import 'graphiql/graphiql.css'

import Breadcrumbs from 'components/Breadcrumbs'

export default class extends Component {
	static pageProps = {
		useNavigation: false,
		fluidContainer: true,
	}

	fetch(params) {
		return fetch('/graphql', {
			credentials: 'same-origin',
			method: 'POST',
			headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
			body: JSON.stringify(params),
		}).then(response => response.json())
	}

	render() {
		return <div>
			<Breadcrumbs items={[['Run GraphQL queries', '/graphiql']]} />
			<GraphiQL fetcher={this.fetch} />
		</div>
	}
}
