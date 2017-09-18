import React, {Component} from 'react'
import {Button, Modal} from 'react-bootstrap'
import 'components/reactTags.css'

import Fieldset from 'components/Fieldset'
import moment from 'moment'


export default class ReportApprovals extends Component {

    constructor(props) {
        super(props)
        this.state = { }
        this.renderApprovalAction = this.renderApprovalAction.bind(this)
        this.showApproversModal = this.showApproversModal.bind(this)
        this.closeApproversModal = this.closeApproversModal.bind(this)
    }

    render() {
        let report = this.props.report
        return <Fieldset id="approvals" title="Approvals">
        {report.approvalStatus.map(action =>
            this.renderApprovalAction(action)
        )}
        </Fieldset>
    }

    showApproversModal(step) {
        step.showModal = true
        this.setState(this.state)
    }

    closeApproversModal(step) {
        step.showModal = false
        this.setState(this.state)
    }
    
    renderApprovalAction(action) {
        let step = action.step
        return <div key={step.id}>
            <Button onClick={this.showApproversModal.bind(this, step)}>
                {step.name}
            </Button>
            <Modal show={step.showModal} onHide={this.closeApproversModal.bind(this, step)}>
                <Modal.Header closeButton>
                    <Modal.Title>Approvers for {step.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul>
                    {step.approvers.map(p =>
                        <li key={p.id}>{p.name} - {p.person && p.person.name}</li>
                    )}
                    </ul>
                </Modal.Body>
            </Modal>
        {action.type ?
                <span> {action.type} by {action.person.name} <small>{moment(action.createdAt).format('D MMM YYYY')}</small></span>
                :
                <span className="text-danger"> Pending</span>
            }
        </div>
    }
}
