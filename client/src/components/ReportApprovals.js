import React, {Component} from 'react'
import {Button, Modal} from 'react-bootstrap'

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
        let title = "Approval State"
        let fieldset = null
        if(this.props.fullReport) {
            fieldset = this.renderFullApprovalView(report, title)
        } else {
            fieldset = this.renderCompactApprovalView(report, title)
        }
        return fieldset
    }

    mapApprovalStatusToAction(report) {
        return report.approvalStatus.map(action =>
            this.renderApprovalAction(action)
        )
    }

    showApproversModal(step) {
        step.showModal = true
        this.setState(this.state)
    }

    closeApproversModal(step) {
        step.showModal = false
        this.setState(this.state)
    }

    renderFullApprovalView(report, title){
        return (
            <Fieldset id="approvals" className="approval-fieldset" title={title}>
                { this.mapApprovalStatusToAction(report) }
            </Fieldset>
        )
    }

    renderCompactApprovalView(report, title){
        return (
            <Fieldset className="approval-fieldset" title={title}>
                { this.mapApprovalStatusToAction(report) }
            </Fieldset>
        )
    }
    
    renderApprovalModal(step) {
        return (
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
        )
    }

    renderApprovalButton(action) {
        let step = action.step
        let buttonColor = (action.type) ? 'btn-success' : 'btn-danger'
        return (
            <Button className={buttonColor} onClick={this.showApproversModal.bind(this, step)}>
                <span>{step.name}</span>
            </Button>
        )
    }

    renderApprovalAction(action) {
        let step = action.step
        let approvalButton = this.renderApprovalButton(action)
        let approvalModal = this.renderApprovalModal(step)
        return (
            <div key={step.id}>
                { approvalButton }
                { approvalModal }
                {action.type ?
                    <span> {action.type} by {action.person.name}
                        <small>{moment(action.createdAt).format('D MMM YYYY')}</small>
                    </span>
                    :
                    <span className="text-danger"> Pending</span>
                }
            </div>
        )
    }
}
