import React, {Component} from 'react'
import _get from 'lodash.get'
import autobind from 'autobind-decorator'

import NotFound from 'components/NotFound'
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
	constructor() {
		super()

		this.state = {notFound: false}

		this.renderPage = this.render
		this.render = Page.prototype.render
	}

	componentWillMount() {
		window.scrollTo(0,0)

		if (document.querySelector(NPROGRESS_CONTAINER)) {
			NProgress.start()
		}
	}

	loadData(props) {
		this.setState({notFound: false})

		if (this.fetchData) {
			document.body.classList.add('loading')

			this.fetchData(props || this.props)

			let promise = API.inProgress

			if (promise && promise instanceof Promise) {
				NProgress.set(0.5)
				promise.then(this.doneLoading, this.doneLoading)
			} else {
				this.doneLoading()
			}

			return promise
		} else {
			this.doneLoading()
		}
	}

	@autobind
	doneLoading(response) {
		NProgress.done()
		document.body.classList.remove('loading')

		if (response) {
			if (response.status === 404 || (response.status === 500 && _get(response, ['errors', 0]) === 'Invalid Syntax')) {
				this.setState({notFound: true})
			}
		}

		return response
	}

	render() {
		if (this.state.notFound) {
			let modelName = this.constructor.modelName
			let text = modelName ? `${modelName} #${this.props.params.id}` : `Page`
			return <NotFound text={`${text} not found.`} />
		}

		return this.renderPage()
	}

	componentWillReceiveProps(props, nextContext) {
		if (props !== this.props) {
			this.loadData(props)
		} else if (this.context && (this.context !== nextContext)) {
			this.loadData(props)
		}
	}

	componentDidMount() {
		setMessages(this.props, this.state)
		this.loadData(this.props)
	}
}
