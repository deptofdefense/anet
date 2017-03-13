import React from 'react'
import {Button} from 'react-bootstrap'

import TOUR_ICON from 'resources/tour-icon2.png'

const iconCss = {
	width: '20px',
	marginLeft: '8px',
}

export default function HopscotchLauncher(props) {
	return <Button bsStyle="link" onClick={props.onClick}>
		New to ANET? Take a guided tour
		<img src={TOUR_ICON} className="tour-icon" alt="Take a tour of ANET" style={iconCss} />
	</Button>
}
