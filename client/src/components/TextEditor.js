import React, {Component} from 'react'
import {Editor, EditorState, RichUtils, ContentState} from 'draft-js'

import './TextEditor.css'

// Custom overrides for "code" style.
const styleMap = {
CODE: {
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
  fontSize: 16,
  padding: 2,
},
};

export default class TextEditor extends Component {
        constructor(props) {
          super(props);

          this.state = {
              editorState: props.value ? EditorState.createWithContent(ContentState.createFromText(props.value)) : EditorState.createEmpty()
          }

          this.focus = () => this.refs.editor.focus();
          this.onChange = (editorState) => {
              this.setState({editorState});
              if (props.onChange) {
                props.onChange(editorState.getCurrentContent().getPlainText())
              }
          }

          this.handleKeyCommand = (command) => this._handleKeyCommand(command);
          this.onTab = (e) => this._onTab(e);
          this.toggleBlockType = (type) => this._toggleBlockType(type);
          this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
        }

        _handleKeyCommand(command) {
          const {editorState} = this.state;
          const newState = RichUtils.handleKeyCommand(editorState, command);
          if (newState) {
            this.onChange(newState);
            return true;
          }
          return false;
        }

        _onTab(e) {
          const maxDepth = 4;
          this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
        }

        _toggleBlockType(blockType) {
          this.onChange(
            RichUtils.toggleBlockType(
              this.state.editorState,
              blockType
            )
          );
        }

        _toggleInlineStyle(inlineStyle) {
          this.onChange(
            RichUtils.toggleInlineStyle(
              this.state.editorState,
              inlineStyle
            )
          );
        }

        render() {
          const {editorState} = this.state;

          // If the user changes block type before entering any text, we can
          // either style the placeholder or hide it. Let's just hide it now.
          let className = 'RichEditor-editor';
          var contentState = editorState.getCurrentContent();
          if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
              className += ' RichEditor-hidePlaceholder';
            }
          }

          return (
            <div className="RichEditor-root" style={this.props.style}>
              {this.props.label && <label>{this.props.label}</label>}
              <BlockStyleControls
                editorState={editorState}
                onToggle={this.toggleBlockType}
              />
              <InlineStyleControls
                editorState={editorState}
                onToggle={this.toggleInlineStyle}
              />
              <div className={className} onClick={this.focus}>
                <Editor
                  blockStyleFn={getBlockStyle}
                  customStyleMap={styleMap}
                  editorState={editorState}
                  handleKeyCommand={this.handleKeyCommand}
                  onChange={this.onChange}
                  onTab={this.onTab}
                  placeholder={this.props.placeholder}
                  ref="editor"
                  spellCheck={true}
                />
              </div>
            </div>
          );
        }
      }

      function getBlockStyle(block) {
        switch (block.getType()) {
          case 'blockquote': return 'RichEditor-blockquote';
          default: return null;
        }
      }

      class StyleButton extends Component {
        constructor() {
          super();
          this.onToggle = (e) => {
            e.preventDefault();
            this.props.onToggle(this.props.style);
          };
        }

        render() {
          let className = 'RichEditor-styleButton';
          if (this.props.active) {
            className += ' RichEditor-activeButton';
          }

          return (
            <span className={className} onMouseDown={this.onToggle}>
              {this.props.icon || this.props.label}
            </span>
          );
        }
      }

      const BLOCK_TYPES = [
        {label: "Unordered list", icon: '•', style: 'unordered-list-item'},
        {label: "Numbered list", icon: '⒈', style: 'ordered-list-item'},
      ];

      const BlockStyleControls = (props) => {
        const {editorState} = props;
        const selection = editorState.getSelection();
        const blockType = editorState
          .getCurrentContent()
          .getBlockForKey(selection.getStartKey())
          .getType();

        return (
          <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
              <StyleButton
                key={type.label}
                active={type.style === blockType}
                label={type.label}
                onToggle={props.onToggle}
                style={type.style}
                icon={type.icon}
              />
            )}
          </div>
        );
      };

      var INLINE_STYLES = [
        {label: 'Bold', icon: '𝗕', style: 'BOLD'},
        {label: 'Italic', icon: '𝘐', style: 'ITALIC'},
        {label: 'Underline', icon: '𝑈', style: 'UNDERLINE'},
      ];

      const InlineStyleControls = (props) => {
        var currentStyle = props.editorState.getCurrentInlineStyle();
        return (
          <div className="RichEditor-controls">
            {INLINE_STYLES.map(type =>
              <StyleButton
                key={type.label}
                active={currentStyle.has(type.style)}
                label={type.label}
                onToggle={props.onToggle}
                style={type.style}
                icon={type.icon}
              />
            )}
          </div>
        );
      };
