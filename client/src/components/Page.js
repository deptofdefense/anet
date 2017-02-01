import {Component} from 'react'
import {setMessages} from 'components/Messages'
import API from 'api'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const NPROGRESS_CONTAINER = '.header'

if (process.env.NODE_ENV !== 'test') {
	NProgress.configure({
		parent: NPROGRESS_CONTAINER
	})
}

export default class Page extends Component {
	componentWillMount() {
		window.scrollTo(0,0)

		if (document.querySelector(NPROGRESS_CONTAINER)) {
			NProgress.start()
		}
	}

	loadData(props) {
		if (this.fetchData) {
			document.body.classList.add('loading')

			this.fetchData(props || this.props)

			let promise = API.inProgress
			if (promise && promise instanceof Promise) {
				NProgress.set(0.5)

				promise.then(response => {
					NProgress.done()
					document.body.classList.remove('loading')
					return response
				})
			} else {
				NProgress.done()
				document.body.classList.remove('loading')
			}

			return promise
		} else {
			NProgress.done()
		}
	}

	componentWillReceiveProps(props) {
		if (props !== this.props) {
			this.loadData(props)
		}
	}

	componentDidMount() {
		setMessages(this.props, this.state)
		this.loadData(this.props)
	}
}
