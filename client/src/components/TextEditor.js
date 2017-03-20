import React, {Component} from 'react'

import AlloyEditor from 'alloyeditor/dist/alloy-editor/alloy-editor-no-react'
import 'alloyeditor/dist/alloy-editor/assets/alloy-editor-atlas.css'

// this just removes a number of features we don't want from the Alloy toolbar
AlloyEditor.Selections[3].buttons.splice(4, 2)

const ALLOY_CONFIG = {
	toolbars: {
		styles: { selections: AlloyEditor.Selections },
		add: { buttons: ['ul', 'ol', 'hline', 'table'] },
	}
}

export default class TextEditor extends Component {
	componentDidMount() {
		if (!this.editor) {
			this.editor = AlloyEditor.editable(this.container, ALLOY_CONFIG)
			this.nativeEditor = this.editor.get('nativeEditor')

			this.nativeEditor.on('change', () => {
				this.props.onChange(this.nativeEditor.getData())
			})
		}

		this.componentWillReceiveProps(this.props)
	}

	componentWillUnmount() {
		this.editor && this.editor.destroy()
	}

	componentWillReceiveProps(newProps) {
		let html = newProps.value
		if (html !== this.nativeEditor.getData()) {
			this.nativeEditor.setData(html)
		}
	}

	render() {
		return <div className="text-editor" ref={(el) => { this.container = el }} />
	}
}
