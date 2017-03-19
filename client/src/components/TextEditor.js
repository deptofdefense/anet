import React, {Component} from 'react'

import AlloyEditor from 'alloyeditor/dist/alloy-editor/alloy-editor-no-react'
import 'alloyeditor/dist/alloy-editor/assets/alloy-editor-atlas.css'

export default class TextEditor extends Component {
	componentDidMount() {
		this.editor = AlloyEditor.editable(this.container)

		this.componentWillReceiveProps(this.props)
	}

	componentWillUnmount() {
		this.editor.destroy()
	}

	componentWillReceiveProps(newProps) {
		this.container.innerHTML = newProps.value
	}

	render() {
		return <div>
			<div className="text-editor" ref={(el) => { this.container = el }} />
		</div>
	}
}
