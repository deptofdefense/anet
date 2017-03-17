import React, {Component} from 'react'

export default class NotFound extends Component {
    componentWillMount() {
        document.getElementsByTagName('html')[0].classList.add('not-found')
    }

    componentWillUnmount() {
        document.getElementsByTagName('html')[0].classList.remove('not-found')
    }

	render() {
		return <div>
            <h1 className="not-found-text">{this.props.text}</h1>
        </div>
	}
}
