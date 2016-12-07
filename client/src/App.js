import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'

import {Button, Modal} from 'react-bootstrap'

class App extends Component {
	constructor(props) {
		super(props)
		this.state = {showModal: false}
	}

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <div className="App-intro">
			<p>Hello world!</p>

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

export default App;
