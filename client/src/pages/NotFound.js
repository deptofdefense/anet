import React from 'react'
import Page from 'components/Page'

export default class NotFound extends Page {
    static pageProps = {
        useNavigation: false
    }

    componentWillMount() {
        document.querySelector('body').classList.add('not-found')
    }

    componentWillUnmount() {
        document.querySelector('body').classList.remove('not-found')
    }
    
	render() {
		return <div>
            <h1>404 Not Found</h1>
        </div>
	}
}
