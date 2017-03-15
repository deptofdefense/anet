import {Component} from 'react'
import {setMessages} from 'components/Messages'
import API from 'api'

export default class Page extends Component {
	componentWillMount() {
		window.scrollTo(0,0)
	}

	loadData(props) {
		if (this.fetchData) {
			return this.fetchData(props || this.props)
		}
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
