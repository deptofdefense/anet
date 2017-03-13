import React, {Component} from 'react'
import Form from 'components/Form'
import autobind from 'autobind-decorator'

import _some from 'lodash.some'
import _values from 'lodash.values'
import _get from 'lodash.get'

export default class ValidatableFormWrapper extends Component {
    @autobind
    ValidatableForm(props) {
		const isSubmitDisabled = () => {
			return _some(_values(this.state.formErrors))
		}
        return <Form {...props} submitDisabled={isSubmitDisabled()} />
    }

	@autobind
	RequiredField(props) {
		const onError = () => this.setState({formErrors: {...this.state.formErrors, [props.id]: true}})
		const onValid = () => this.setState({formErrors: {...this.state.formErrors, [props.id]: false}})

		return <Form.Field {...Object.without(props, 'required')} 
			onError={onError}
			onValid={onValid}
			required={_get(props, 'required', true)} />
	}
}