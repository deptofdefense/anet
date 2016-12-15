import React from 'react'
import {Button, Modal} from 'react-bootstrap'

import Breadcrumbs from '../components/Breadcrumbs'

export default class Home extends React.Component {
	constructor(props) {
		super(props)
		this.state = {showModal: false}
	}

	render() {
		return (
			<div>
				<Breadcrumbs />

				<Button bsStyle="primary" onClick={this.openModal}>Open Modal</Button>

				<Modal show={this.state.showModal} onHide={this.closeModal}>
					<Modal.Header closeButton>
						<Modal.Title>Header</Modal.Title>
					</Modal.Header>

					<Modal.Body>
						This is the modal body.
					</Modal.Body>
				</Modal>
			</div>
		)
	}

	openModal = () => {
		this.setState({showModal: true})
	}

	closeModal = () => {
		this.setState({showModal: false})
	}
}
