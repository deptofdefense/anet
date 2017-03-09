import 'bootstrap/dist/css/bootstrap.css'
import './index.css'

import 'core-js/shim'
import 'locale-compare-polyfill'
import './utils'

import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
import {InjectablesProvider} from 'react-injectables'

import API from 'api'

import App from './pages/App'
import Home from './pages/Home'
import Search from './pages/Search'
import PageMissing from './pages/PageMissing'

import ReportsIndex from './pages/reports/Index'
import ReportNew from './pages/reports/New'
import ReportShow from './pages/reports/Show'
import ReportEdit from './pages/reports/Edit'
import ReportMinimal from './pages/reports/Minimal'

import PersonShow from './pages/people/Show'
import PersonNew from './pages/people/New'
import PersonEdit from './pages/people/Edit'

import PoamShow from './pages/poams/Show'
import PoamNew from './pages/poams/New'
import PoamEdit from './pages/poams/Edit'

import OrganizationShow from './pages/organizations/Show'
import OrganizationNew from './pages/organizations/New'
import OrganizationEdit from './pages/organizations/Edit'

import LocationShow from './pages/locations/Show'
import LocationNew from './pages/locations/New'

import PositionShow from './pages/positions/Show'
import PositionEdit from './pages/positions/Edit'
import PositionNew from './pages/positions/New'

import RollupShow from './pages/rollup/Show'

import AdminIndex from './pages/admin/Index'

import GraphiQL from './pages/GraphiQL'

import OnboardingShow from './pages/onboarding/Show'

ReactDOM.render((
	<InjectablesProvider>
		<Router history={browserHistory}>
			<Route path="/" component={App} getIndexRoute={getIndexRoute}>
				<Route path="search" component={Search} />

				<Route path="reports">
					<IndexRoute component={ReportsIndex} />
					<Route path="new" component={ReportNew} />
					<Route path=":id/edit" component={ReportEdit} />
					<Route path=":id/min" component={ReportMinimal} />
					<Route path=":id" component={ReportShow} />
				</Route>

				<Route path="people">
					<Route path="new" component={PersonNew} />
					<Route path=":id/edit" component={PersonEdit} />
					<Route path=":id" component={PersonShow} />
				</Route>

				<Route path="organizations">
					<Route path="new" component={OrganizationNew} />
					<Route path=":id/edit" component={OrganizationEdit} />
					<Route path=":id(/:action)" component={OrganizationShow} />
				</Route>

				<Route path="locations">
					<Route path="new" component={LocationNew} />
					<Route path=":id" component={LocationShow} />
				</Route>

				<Route path="positions">
					<Route path="new" component={PositionNew} />
					<Route path=":id/edit" component={PositionEdit} />
					<Route path=":id" component={PositionShow} />
				</Route>

				<Route path="poams">
					<Route path="new" component={PoamNew} />
					<Route path=":id/edit" component={PoamEdit} />
					<Route path=":id" component={PoamShow} />
				</Route>

				<Route path="rollup" component={RollupShow} />

				<Route path="graphiql" component={GraphiQL} />

				<Route path="admin" component={AdminIndex} />

				<Route path="onboarding" component={OnboardingShow} />
				<Route path="*" component={PageMissing} />
			</Route>
		</Router>
	</InjectablesProvider>
), document.getElementById('root'))

/**
 * react-router allows us to dynamically determine what the path '/' resolves to.
 * We would like to choose that for the user based on whether this is their first
 * time to the app.
 */
function getIndexRoute(_, cb) {
	API.query(/* GraphQL */`
		person(f:me) {
			status
		}
	`).then(
		({person}) => cb(null, <Route component={person.status === 'NEW_USER' ? OnboardingShow : Home} />)
	)
}
