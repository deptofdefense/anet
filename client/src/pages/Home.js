import React from 'react'
import {Button, Modal, Breadcrumb} from 'react-bootstrap'
import {IndexLinkContainer as Link} from 'react-router-bootstrap'

export default class Home extends React.Component {
	constructor(props) {
		super(props)
		this.state = {showModal: false}
	}

	render() {
		return (
			<div>
				<Breadcrumb>
					<Link to="/">
						<Breadcrumb.Item>ANET</Breadcrumb.Item>
					</Link>
					<Link to="/organization/ef4">
						<Breadcrumb.Item>EF4</Breadcrumb.Item>
					</Link>
					<Link to="/organization/ef4/advisors">
						<Breadcrumb.Item>Advisors</Breadcrumb.Item>
					</Link>
				</Breadcrumb>

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
