import React, { Component } from 'react'

import {Button, Modal} from 'react-bootstrap'
import Security from './components/security'

class App extends Component {
	constructor(props) {
		super(props)
		this.state = {showModal: false}
	}

	render() {
		return (
			<div className="anet">
				<Security />

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
		);
	}

	openModal = () => {
		this.setState({showModal: true})
	}

	closeModal = () => {
		this.setState({showModal: false})
	}
}

export default App
