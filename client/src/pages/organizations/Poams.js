import React, {Component, PropTypes} from 'react'
import {Table, Pagination} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import Fieldset from 'components/Fieldset'
import LinkTo from 'components/LinkTo'

import {Poam} from 'models'

export default class OrganizationPoams extends Component {
	static contextTypes = {
		currentUser: PropTypes.object.isRequired,
	}

	render() {
		let currentUser = this.context.currentUser

		let org = this.props.organization
		if (!org.isAdvisorOrg()) {
			return <div></div>
		}

		let poams = this.props.poams.list || []
		let isSuperUser = currentUser && currentUser.isSuperUserForOrg(org)

		return <Fieldset id="poams" title="PoAMs / Pillars" action={
			isSuperUser && <LinkTo poam={Poam.pathForNew({responsibleOrgId: org.id})} button>Create PoAM</LinkTo>
		}>
			{this.pagination()}
			<Table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Description</th>
					</tr>
				</thead>

				<tbody>
					{Poam.map(poams, (poam, idx) =>
						<tr key={poam.id} id={`poam_${idx}`} >
							<td><LinkTo poam={poam} >{poam.shortName}</LinkTo></td>
							<td>{poam.longName}</td>
						</tr>
					)}
				</tbody>
			</Table>

			{poams.length === 0 && <em>This organization doesn't have any PoAMs</em>}
		</Fieldset>
	}

	@autobind
	pagination() {
		let goToPage = this.props.goToPage
		let {pageSize, pageNum, totalCount} = this.props.poams
		let numPages = Math.ceil(totalCount / pageSize)
		if (numPages < 2 ) { return }
		return <header className="searchPagination" ><Pagination
			className="pull-right"
			prev
			next
			items={numPages}
			ellipsis
			maxButtons={6}
			activePage={pageNum + 1}
			onSelect={(value) => goToPage(value - 1)}
		/></header>
	}
}
