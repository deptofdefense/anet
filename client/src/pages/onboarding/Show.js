import React from 'react'
import Page from 'components/Page'
import {Button} from 'react-bootstrap'

export default class OnboardingShow extends Page {
    static pageProps = {
        useNavigation: false,
        minimalHeader: true
	}

	constructor(props) {
		super(props)
		this.state = {}
	}

	render() {
		return (
            <div className="onboarding-new">
			    <h1>Welcome to ANET</h1>
                <p>ANET is an information system for reporting on TAA engagements, and learning about past engagements and people.</p>
                <p>Let's create a new account for your as an ADVISOR. We'll get your basic information that will allow your supervisor to approve your account.</p>
                <div className="create-account-button-wrapper">
                    <Button bsStyle="primary">Create your account</Button>
                </div>
                <div className="help">
                    <p>Concerned or stuck?</p>
                    <p>Contact the ANET help desk team at CJ7 TREXS.</p>
                    <p>555-555-5555555</p>
                </div>
			</div>
		)
	}
}
