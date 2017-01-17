import React, {Component} from 'react'

import Breadcrumbs from 'components/Breadcrumbs'

var GraphiQL = null

export default class extends Component {
	static pageProps = {
		useNavigation: false,
		fluidContainer: true,
	}

	componentDidMount() {
		if (GraphiQL)
			return

		require.ensure([], () => {
			GraphiQL = require('graphiql')
			require('graphiql/graphiql.css')
			this.forceUpdate()
		})
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
			{GraphiQL ? <GraphiQL fetcher={this.fetch} /> : "Loading..."}
		</div>
	}
}
