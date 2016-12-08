import React from 'react'
import {FormGroup, Col, ControlLabel, FormControl} from 'react-bootstrap'

function HorizontalFormField({id, label, children, rightComponentClass, ...props}) {
	return (
		<FormGroup controlId={id}>
			<Col sm={3} componentClass={ControlLabel}>
				{label}
			</Col>
			<Col sm={7}>
				{children || <FormControl {...props} />}
			</Col>
			{/*rightComponentClass && <Col sm={2} componentClass={rightComponentClass}></Col>*/}
		</FormGroup>
	)
}

export {HorizontalFormField}
