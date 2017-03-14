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
                <p>ANET is a training system for reporting TAA engagements, and learning about past engagements and people.</p>
                <p>Let's create a new account for you. We'll grab your basic information and help your super user get you set up. If you had an account in ANET 1 and are seeing this page, let your super user know that you'll need to get your old account merged with the one you're about to create.</p>
                <div className="create-account-button-wrapper">
                    <Button bsStyle="primary" onClick={() => this.onCreateAccountClick(currentUser)}>Create your account</Button>
                </div>
			</div>
		)
	}

    @autobind
    onCreateAccountClick(currentUser) {
        History.push(Person.pathForEdit(currentUser))
    }
}
