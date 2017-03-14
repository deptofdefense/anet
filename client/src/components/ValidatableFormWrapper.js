import React, {Component} from 'react'
import Form from 'components/Form'
import autobind from 'autobind-decorator'

import utils from 'utils'

import _some from 'lodash.some'
import _values from 'lodash.values'
import _get from 'lodash.get'

export default class ValidatableFormWrapper extends Component {
	constructor() {
		super()
		this.state = {}
	}

    @autobind
    ValidatableForm(props) {
		const isSubmitDisabled = () => {
			return !props.canSubmitWithError && _some(_values(this.state.formErrors))
		}
		const onSubmit = () => {
			this.setState({afterSubmit: true})
			props.onSubmit && props.onSubmit()
		}
        return <Form {...props} submitDisabled={isSubmitDisabled()} onSubmit={onSubmit} />
    }

	@autobind
	RequiredField(props) {
		const onError = () => this.setState({formErrors: {...this.state.formErrors, [props.id]: true}})
		const onValid = () => this.setState({formErrors: {...this.state.formErrors, [props.id]: false}})

		return <Form.Field {...Object.without(props, 'required', 'humanName', 'validateBeforeUserTouches')} 
			validateBeforeUserTouches={this.state.afterSubmit || props.validateBeforeUserTouches}
			onError={onError}
			onValid={onValid}
			humanName={props.humanName || props.label || utils.sentenceCase(props.id)}
			required={_get(props, 'required', true)} />
	}
}