import React from 'react'
import Page from 'components/Page'

export default class NotFound extends Page {
    static pageProps = {
        useNavigation: false
    }

    constructor() {
        super()
        this.state = {}
    }

    componentWillMount() {
        document.getElementsByTagName('html')[0].classList.add('not-found')
    }

    componentWillUnmount() {
        document.getElementsByTagName('html')[0].classList.remove('not-found')
    }
    
	render() {
		return <div>
            <h1>404 Not Found</h1>
        </div>
	}
}
