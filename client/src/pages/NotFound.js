import React from 'react'
import Page from 'components/Page'

import FACE_1 from 'resources/face-1.png'

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
            <img src={FACE_1} className="face-1" />
            <h1 className="not-found-text">404 Not Found</h1>
        </div>
	}
}
