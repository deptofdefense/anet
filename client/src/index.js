import 'bootstrap/dist/css/bootstrap.css'
import './index.css'

import 'core-js/shim'

import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
import {InjectablesProvider} from 'react-injectables'

import GraphiQL from 'graphiql'
import 'graphiql/graphiql.css'

import App from './pages/App'
import Home from './pages/Home'
import Search from './pages/Search'
import ReportsIndex from './pages/reports/Index'
import ReportNew from './pages/reports/New'
import ReportShow from './pages/reports/Show'

function gqlFetcher(params) {
	return fetch('/graphql', {
		credentials: 'same-origin',
		method: 'POST',
		headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
		body: JSON.stringify(params),
	}).then(response => response.json())
}

function GQL(props) {
	return <GraphiQL fetcher={gqlFetcher} />
}

ReactDOM.render((
	<InjectablesProvider>
		<Router history={browserHistory}>
			<Route path="/" component={App}>
				<IndexRoute component={Home} />
				<Route path="search" component={Search} />

				<Route path="reports">
					<IndexRoute component={ReportsIndex} />
					<Route path="new" component={ReportNew} />
					<Route path=":id" component={ReportShow} />
				</Route>

				<Route path="/graphiql" component={GQL} />
			</Route>
		</Router>
	</InjectablesProvider>
), document.getElementById('root'))
