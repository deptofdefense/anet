import React, {Component} from 'react'

import FACE_1 from 'resources/face-1.png'
import FACE_2 from 'resources/face-2.png'
import FACE_3 from 'resources/face-3.png'
import PLANET from 'resources/planet.png'

export default class NotFound extends Component {
    componentWillMount() {
        document.getElementsByTagName('html')[0].classList.add('not-found')
    }

    componentWillUnmount() {
        document.getElementsByTagName('html')[0].classList.remove('not-found')
    }
    
	render() {
		return <div>
            <h1 className="not-found-text">{this.props.notFoundText}</h1>
            <div className="face-row">
                <div className="image-container">
                    <img src={FACE_3} className="face-3" role="presentation" />
                </div>
                <div className="image-container face-2">
                    <img src={FACE_2} className="face-2" role="presentation" />
                </div>
                <div className="image-container face-1">
                    <img src={FACE_1} className="face-1" role="presentation" />
                </div>
            </div>
            <img src={PLANET} className="planet" role="presentation" />
        </div>
	}
}
