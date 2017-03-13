import React, {Component} from 'react'
import Form from 'components/Form'
import autobind from 'autobind-decorator'

import _some from 'lodash.some'
import _values from 'lodash.values'

export default class ValidatableFormWrapper extends Component {
    constructor() {
        super()
        this.state = {
            formErrors: {}
        }
    }

    @autobind
    ValidatableForm(props) {
        return <Form {...props} submitDisabled={this.isSubmitDisabled()} />
    }

	@autobind
	onFieldEnterErrorState(fieldName) {
		this.setState({formErrors: {[fieldName]: true}})
	}

	@autobind
	onFieldExitErrorState(fieldName) {
		this.setState({formErrors: {[fieldName]: false}})
	}

	@autobind
	isSubmitDisabled() {
		return _some(_values(this.state.formErrors))
	}

}