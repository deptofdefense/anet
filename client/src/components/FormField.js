import React from 'react'
import _ from 'lodash'
import {FormGroup, Col, ControlLabel, FormControl, InputGroup} from 'react-bootstrap'

function HorizontalFormField({id, label, children, addon, ...props}) {
	label = label || _.upperFirst(_.startCase(id).toLowerCase())

	var content
	if (props.type === 'static')
		content = <FormControl.Static>{children || props.value}</FormControl.Static>
	else
		content = children || <FormControl {...props} />

	return (
		<FormGroup controlId={id}>
			<Col sm={2} componentClass={ControlLabel}>
				{label}
			</Col>
			<Col sm={7}>
				{addon ? (<InputGroup>{content}<InputGroup.Addon>{addon}</InputGroup.Addon></InputGroup>) : content}
			</Col>
		</FormGroup>
	)
}

export {HorizontalFormField}
