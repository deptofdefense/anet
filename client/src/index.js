import 'bootstrap/dist/css/bootstrap.css'
import './index.css'

import 'core-js/shim'
import './utils'

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

import PersonShow from './pages/people/Show'
import PersonNew from './pages/people/New'

import OrganizationShow from './pages/organizations/Show'
import OrganizationNew from './pages/organizations/New'

import PositionShow from './pages/positions/Show'
import PositionNew from './pages/positions/New'

import AdminIndex from './pages/admin/Index'

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

				<Route path="people">
					<Route path="new" component={PersonNew} />
					<Route path=":id" component={PersonShow} />
				</Route>

				<Route path="organizations">
					<Route path="new" component={OrganizationNew} />
					<Route path=":id" component={OrganizationShow} />
				</Route>

				<Route path="positions">
					<Route path="new" component={PositionNew} />
					<Route path=":id" component={PositionShow} />
				</Route>

				<Route path="graphiql" component={GraphiQL} />

				<Route path="admin" component={AdminIndex} />
			</Route>
		</Router>
	</InjectablesProvider>
), document.getElementById('root'))
