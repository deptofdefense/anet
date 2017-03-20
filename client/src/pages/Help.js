import React, {Component, PropTypes} from 'react'

import Fieldset from 'components/Fieldset'

export default class Help extends Component {
	state = {
		superUsers: []
	}

	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	render() {
		let {settings} = this.context.app.state || {}
		let url = settings.HELP_LINK_URL
		let email = settings.CONTACT_EMAIL

		return <div className="help-page">
			<Fieldset title="Need help with ANET?">
				<p className="help-text">There are a few ways to get help:</p>

				<h4>1. Use the guided tours</h4>
				<p>If you're stuck on a page and you don't know what to do, look for the <strong>"Take a tour"</strong> link near the top of the page.</p>

				<h4>2. Email your super user</h4>
				<p>Your organization's super users are able to modify a lot of data in the system regarding how your organization, position, principal, and profile are set up.</p>
				<p>Your super users:</p>
				<ul>
					{this.state.superUsers.map(user => {
						<li key={user.id}>
							<a href={`mailto:`}>{user.name}</a>
						</li>
					})}
					{this.state.superUsers.length === 0 && <em>No super users found</em>}
				</ul>

				<h4>3. Check out the FAQ</h4>
				<p>Many common issues are explained in the FAQ document, especially for common super user tasks. The FAQ is available on the portal at <a href={url} target="help">{url}</a></p>

				<h4>4. Contact ANET support</h4>
				<p>Technical issues may be able to be resolved by the ANET administrators: <a href={`mailto:${email}`}>{email}</a></p>
			</Fieldset>
		</div>
	}
}
