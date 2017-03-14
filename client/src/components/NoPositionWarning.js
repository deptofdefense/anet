import React from 'react'
import {Alert} from 'react-bootstrap'
import _get from 'lodash.get'

export default function NoPositionWarning(props) {
    if (_get(props, ['position', 'id'])) {
        return null
    }
    return <Alert bsStyle="danger" className="no-position-warning">
        You're not in a position yet. Contact your super user to let them know.
    </Alert>
}