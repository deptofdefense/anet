import React from 'react'
import {InputGroup} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import DatePicker from 'react-bootstrap-date-picker'

import {ContentForHeader} from 'components/Header'
import History from 'components/History'
import Form from 'components/Form'
import Breadcrumbs from 'components/Breadcrumbs'
import TextEditor from 'components/TextEditor'
import Autocomplete from 'components/Autocomplete'

import API from 'api'
import {Poam} from 'models'

export default class PoamNew extends React.Component {
	static contextTypes = {
		router: React.PropTypes.object.isRequired
	}

	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)

		this.state = {
			poam: new Poam(),
		}
	}

	render() {
		let poam = this.state.poam

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Poam</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Create new Poam', '/poams/new']]} />

				<Form formFor={poam} onChange={this.onChange} onSubmit={this.onSubmit} horizontal actionText="Create poam">
					{this.state.error && <fieldset><p>There was a problem saving this poam</p><p>{this.state.error}</p></fieldset>}
					<fieldset>
						<legend>Create a new Poam</legend>
						<Form.Field id="shortName" />
						<Form.Field id="longName" />
						<Form.Field id="responsibleOrg">
							<Autocomplete valueKey="name"  
								placeholder="Select a responsible organization for this poam"
								url="/api/organizations/search"
                                valueKey="name" />
						</Form.Field>
					</fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	onChange() {
		let poam = this.state.poam
		this.setState({poam})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		API.send('/api/poams/new', this.state.poam, {disableSubmits: true})
			.then(poam => {
				if (poam.code) throw poam.code
				History.push(Poam.pathFor(poam))
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
