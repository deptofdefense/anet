import {Component} from 'react'
import {setMessages} from 'components/Messages'

export default class Page extends Component {
	fetchData(props) {
	}

	componentWillReceiveProps(props) {
		if (props !== this.props)
			this.fetchData(props)
	}

	componentDidMount() {
		setMessages(this.props,this.state)
		this.fetchData(this.props)
	}

	componentWillMount() {
		window.scrollTo(0,0)
	}
}
