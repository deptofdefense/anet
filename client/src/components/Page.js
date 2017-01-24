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

	_fetchData(props) {
		if (this.fetchData) {
			this.fetchData(props)

			let promise = API.inProgress
			if (promise && promise instanceof Promise) {
				NProgress.set(0.5)

				promise.then(response => {
					NProgress.done()
					return response
				})
			} else {
				NProgress.done()
			}

			return promise
		} else {
			NProgress.done()
		}
	}

	componentWillReceiveProps(props) {
		if (props !== this.props) {
			this._fetchData(props)
		}
	}

	componentDidMount() {
		setMessages(this.props,this.state)
		this._fetchData(this.props)
	}
}
