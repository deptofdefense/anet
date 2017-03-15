import React from 'react'
import {Button} from 'react-bootstrap'

import TOUR_ICON from 'resources/tour-icon.png'

const iconCss = {
	width: '20px',
	marginLeft: '8px',
}

export default function HopscotchLauncher(props) {
	return <Button bsStyle="link" onClick={props.onClick} className="persistent-tour-launcher">
		New to ANET? Take a guided tour
		<img src={TOUR_ICON} className="tour-icon" role="presentation" style={iconCss} />
	</Button>
}
