import React from 'react'
import Page from 'components/Page'

import FACE_1 from 'resources/face-1.png'
import FACE_2 from 'resources/face-2.png'
import FACE_3 from 'resources/face-3.png'
import PLANET from 'resources/planet.png'

export default class NotFound extends Page {
    static pageProps = {
        useGrid: false
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
            <img src={FACE_1} className="face-1" role="presentation" />
            <img src={FACE_2} className="face-2" role="presentation" />
            <img src={FACE_3} className="face-3" role="presentation" />
            <img src={PLANET} className="planet" role="presentation" />
            <h1 className="not-found-text">404 Not Found</h1>
        </div>
	}
}
