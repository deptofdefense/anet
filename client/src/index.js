import 'bootstrap/dist/css/bootstrap.css'
import './index.css'

import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, IndexRoute, browserHistory} from 'react-router'

import App from './pages/App'
import Home from './pages/Home'
import ReportsIndex from './pages/reports/Index'
import ReportNew from './pages/reports/New'
import ReportShow from './pages/reports/Show'

ReactDOM.render((
	<Router history={browserHistory}>
		<Route path="/" component={App}>
			<IndexRoute component={Home} />

			<Route path="reports">
				<IndexRoute component={ReportsIndex} />
				<Route path="new" component={ReportNew} />
				<Route path=":id" component={ReportShow} />
			</Route>
		</Route>
	</Router>
), document.getElementById('root'))
