import React, {Component, PropTypes} from 'react'

import {Collapse} from 'react-bootstrap'
import autobind from 'autobind-decorator'

export class CollapsedContent extends Component {
	render() {
		return <div {...this.props}></div>
	}
}

export class ExpandedContent extends Component {
	render() {
		return <div {...this.props}></div>
	}
}

export default class CollapsableFieldset extends Component {
	static propTypes = {
		title: PropTypes.string,
	}

	constructor(props) {
		super(props);

		this.state = {
			showContent: false
		}
	}

	render() {
		let {title, children} = this.props

		let collapsed = children.find(child => child.type === CollapsedContent)
		let expanded = children.find(child => child.type === ExpandedContent)

		return (
			<fieldset className="collapsable">
				{title && <legend>
					{title}
					<div className="pull-right collapsableToggle" onClick={this.toggleContent} >
						<img src={(this.state.showContent) ? "/assets/img/minus.svg" : "/assets/img/plus.svg"}
							alt="Toggle Content"
							height={12}/>
					</div>
					<hr />
				</legend>}
				<Collapse in={this.state.showContent}>
					<div>
						{expanded}
					</div>
				</Collapse>
				{!this.state.showContent && collapsed}
			</fieldset>
		)
	}

	@autobind
	toggleContent() {
		this.setState({showContent: !this.state.showContent});
	}
}
