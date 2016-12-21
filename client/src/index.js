import 'bootstrap/dist/css/bootstrap.css'
import './index.css'

import 'core-js/shim'

import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
import {InjectablesProvider} from 'react-injectables'

import NProgress from 'nprogress'

import App from './pages/App'
import Home from './pages/Home'
import Search from './pages/Search'
import ReportsIndex from './pages/reports/Index'
import ReportNew from './pages/reports/New'
import ReportShow from './pages/reports/Show'
import GraphiQL from './pages/GraphiQL'

function showLoader() {
	NProgress.start()
	setTimeout(function() {
		if (NProgress.status < 0.5)
			NProgress.done()
	})
}

ReactDOM.render((
	<InjectablesProvider>
		<Router history={browserHistory} onUpdate={showLoader}>
			<Route path="/" component={App}>
				<IndexRoute component={Home} />
				<Route path="search" component={Search} />

				<Route path="reports">
					<IndexRoute component={ReportsIndex} />
					<Route path="new" component={ReportNew} />
					<Route path=":id" component={ReportShow} />
				</Route>

				<Route path="/graphiql" component={GraphiQL} />
			</Route>
		</Router>
	</InjectablesProvider>
), document.getElementById('root'))
