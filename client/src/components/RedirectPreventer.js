import {Component} from 'react'
import _isEqual from 'lodash.isequal'
import _last from 'lodash.last'
import autobind from 'autobind-decorator'
import {withRouter} from 'react-router'

class RedirectPreventer extends Component {

	formHasUnsavedChanges() {
		return !_isEqual(this.props.current, this.props.original)
	}

	@autobind
	onBeforeUnloadListener(event) {
		if (this.formHasUnsavedChanges()) {
			event.returnValue = 'Are you sure you wish to navigate away from the page? You will lose unsaved changes.'
			event.preventDefault()
		}
	}

	@autobind
	routeLeaveHook(nextRoute) {
		if (this.formHasUnsavedChanges()) {
			return 'Are you sure you wish to navigate away from the page? You will lose unsaved changes.'
		}
	}

	componentWillMount() {
		this.unsetRouteLeaveHook = 
			this.props.router.setRouteLeaveHook(_last(this.props.routes), this.routeLeaveHook)
		window.addEventListener('beforeunload', this.onBeforeUnloadListener)
	}

	componentWillUnmount() {
		this.unsetRouteLeaveHook()
		window.removeEventListener('beforeunload', this.onBeforeUnloadListener)
	}

    render() {
        return null
    }

}

export default withRouter(RedirectPreventer)
