import {Component} from 'react'
import autobind from 'autobind-decorator'

import _some from 'lodash.some'
import _values from 'lodash.values'

export default class ValidatableForm extends Component {
    constructor() {
        super()
        this.state = {
            formErrors: {}
        }
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