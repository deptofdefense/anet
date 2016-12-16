import React from 'react'
import {Button, InputGroup, FormControl, Glyphicon} from 'react-bootstrap'

export default class SearchBar extends React.Component {
	render() {
		return (
			<InputGroup>
				<FormControl placeholder="Search for people, reports, positions, or locations" />
				<InputGroup.Button>
					<Button><Glyphicon glyph="search" /></Button>
				</InputGroup.Button>
			</InputGroup>
		)
	}
}
