import React from 'react'
import Page from 'components/Page'
import Header from 'components/Header'

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
            <div>
			    <h1>Welcome to ANET</h1>
			</div>
		)
	}
}
