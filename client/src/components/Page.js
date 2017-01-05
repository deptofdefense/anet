import {Component} from 'react'

export default class Page extends Component {
	fetchData(props) {
	}

	componentWillReceiveProps(props) {
		if (props !== this.props)
			this.fetchData(props)
	}

	componentDidMount() {
		this.fetchData(this.props)
	}
}
