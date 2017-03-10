import React from 'react'
import {Button} from 'react-bootstrap'
import tourIcon from 'resources/tour-icon.svg'
import ReactSVG from 'react-svg'

export default function HopscotchLauncher(props) {
    return <Button bsStyle="primary" className="persistent-tour-launcher" onClick={props.onClick}>
        New to ANET? Take a guided tour.
        <ReactSVG path={tourIcon} className="tour-icon" />
    </Button>
}