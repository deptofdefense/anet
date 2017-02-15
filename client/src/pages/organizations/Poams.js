import React, {Component} from 'react'
import {Table, Pagination} from 'react-bootstrap'
import {Link} from 'react-router'
import autobind from 'autobind-decorator'

import LinkTo from 'components/LinkTo'

import API from 'api'
import {Poam} from 'models'

export default class OrganizationPoams extends Component {
	constructor(props) {
		super(props)

		this.state = {
			poamList: {
				totalCount: 0,
				pageSize: 1,
				pageNum: 0,
				list: [],
			}
		}

		this.fetchData(props)
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			poamList(query:{
				responsibleOrgId:${props.organization.id},
				pageSize:${this.state.poamList.pageSize},
				pageNum:${this.state.poamList.pageNum}
			}) {
				totalCount, pageNum, pageSize, list {
					id, shortName, longName
				}
			}
		`).then(data => this.setState({poamList: data.poamList}))
	}

	render() {
		let org = this.props.organization
		if (org.type !== 'ADVISOR_ORG') {
			return <div></div>
		}

		let poamList = this.state.poamList
		let numPages = Math.ceil(poamList.totalCount / poamList.pageSize)
		let pageNum = poamList.pageNum

		return <fieldset>
			<legend>
				PoAMs / Pillars
				<small><Link to={Poam.pathForNew()}>Create PoAM</Link></small>
			</legend>

			{numPages > 1 && <Pagination
				className="pull-right negative-bottom"
				prev
				next
				items={numPages}
				ellipsis
				maxButtons={6}
				activePage={pageNum + 1}
				onSelect={(value) => {this.goToPage(value - 1)}}
							 />}

			<Table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Description</th>
					</tr>
				</thead>

				<tbody>
					{Poam.map(poamList.list, poam =>
						<tr key={poam.id}>
							<td><LinkTo poam={poam} >{poam.shortName}</LinkTo></td>
							<td>{poam.longName}</td>
						</tr>
					)}
				</tbody>
			</Table>
		</fieldset>
	}

	@autobind
	goToPage(pageNum) {
		let poamList = this.state.poamList
		poamList.pageNum = pageNum
		this.fetchData(this.props)
	}

}
