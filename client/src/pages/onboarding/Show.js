import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Button} from 'react-bootstrap'
import autobind from 'autobind-decorator'
import History from 'components/History'
import {Person} from 'models'

export default class OnboardingShow extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}
    static pageProps = {
        useNavigation: false,
        minimalHeader: true
	}

    constructor() {
        super()
        this.state = {}
    }

	render() {
        const currentUser = this.context.app.state.currentUser
        if (!currentUser) {
            return null
        }
        
		return (
            <div className="onboarding-new">
			    <h1>Welcome to ANET</h1>
                <p>ANET is an information system for reporting on TAA engagements, and learning about past engagements and people.</p>
                <p>Let's create a new account for your as an <span className="role">{currentUser.role}</span>. We'll get your basic information that will allow your supervisor to approve your account.</p>
                <div className="create-account-button-wrapper">
                    <Button bsStyle="primary" onClick={() => this.onCreateAccountClick(currentUser)}>Create your account</Button>
                </div>
                <div className="help">
                    <p>Concerned or stuck?</p>
                    <p>Contact the ANET help desk team at CJ7 TREXS.</p>
                    <p>555-555-5555555</p>
                </div>
			</div>
		)
	}

    @autobind
    onCreateAccountClick(currentUser) {
        History.push(Person.pathForEdit(currentUser))
    }
}
