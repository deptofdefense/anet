import React from 'react'
import _ from 'lodash'
import {FormGroup, Col, ControlLabel, FormControl} from 'react-bootstrap'

function HorizontalFormField({id, label, children, rightComponentClass, ...props}) {
	label = label || _.upperFirst(_.startCase(id).toLowerCase())

	return (
		<FormGroup controlId={id}>
			<Col sm={2} componentClass={ControlLabel}>
				{label}
			</Col>
			<Col sm={7}>
				{props.type === 'static' ? (<FormControl.Static>{children || props.value}</FormControl.Static>) : (children || <FormControl {...props} />)}
			</Col>
			{/*rightComponentClass && <Col sm={2} componentClass={rightComponentClass}></Col>*/}
		</FormGroup>
	)
}

export {HorizontalFormField}
