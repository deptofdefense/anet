import React, {Component} from 'react'

import AlloyEditor from 'alloyeditor/dist/alloy-editor/alloy-editor-no-react'
import 'alloyeditor/dist/alloy-editor/assets/alloy-editor-atlas.css'

export default class TextEditor extends Component {
	componentDidMount() {
		setTimeout(() => {
		this.editor = AlloyEditor.editable(this.container)
		console.log(this.editor);
	}, 500)
	}

	componentWillUnmount() {
		this.editor.destroy()
	}

	render() {
		return <div>
			<div className="text-editor" ref={(el) => { this.container = el }} dangerouslySetInnerHTML={{__html: this.props.value}} />
		</div>
	}
}
