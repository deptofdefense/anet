import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Table } from 'react-bootstrap'
import AdvisorReportsModal from 'components/AdvisorReports/AdvisorReportsModal'
import AdvisorReportsRow from 'components/AdvisorReports/AdvisorReportsRow'
import AdvisorReportsTableHead from 'components/AdvisorReports/AdvisorReportsTableHead'
import './OrganizationAdvisorsTable.css'

class OrganizationAdvisorsTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            selectedAll: false
        }
        this.handleSelectRow = this.handleSelectRow.bind(this)
        this.handleSelectAllRows = this.handleSelectAllRows.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ data: nextProps.data })
    }

    handleSelectRow(index) {
        let data = this.state.data.slice()
        data[index].selected =  this.toggleRowSelection(index)
        this.setState({ data: data })
        this.handleSelectRowData(this.state.data)
    }

    handleSelectAllRows() {
        let toggleSelect = !this.state.selectedAll
        let rows =  this.toggleSelectAllRows(toggleSelect)
        this.setState({
            data: rows,
            selectedAll: toggleSelect 
        })
        this.handleSelectRowData(this.state.data)
    }

    handleSelectRowData() {
        let selectedData = this.state.data.filter( (row) => { return row.selected } )
        this.props.onRowSelection(selectedData)
    }

    toggleRowSelection(index) {
        let isRowSelected = this.state.data[index].selected
        return !isRowSelected
    }

    toggleSelectAllRows(selected) {
        let rows = this.state.data.slice()
        rows.forEach( (item) => {
            item.selected = selected
        })
        return rows
    }

    search(rows, filterText) {
        let nothingFound = <tr className="nothing-found"><td colSpan="8">No organizations found...</td></tr>
        let search = rows.filter( (element) => {
            let props = element.props.row
            let orgName = props.organizationshortname.toLowerCase()
            return orgName.indexOf( filterText.toLowerCase() ) !== -1
        })
        return ( search.length > 0 ) ? search : nothingFound
    }

    createAdvisorReportsRows(data) {
        return data.map( (organization, index) => {
            let checked = (organization.selected === undefined) ? false : organization.selected
            let modalLink = <AdvisorReportsModal 
                                name={ organization.organizationshortname }
                                id={ organization.organizationid }
                                columnGroups={ this.props.columnGroups } />

            return <AdvisorReportsRow
                        link={ modalLink }
                        row={ organization }
                        columnGroups={ this.props.columnGroups }
                        checked={ checked }
                        handleOrganizationClick={ () => this.handleOrganizationClick(index) }
                        onSelectRow={ () => this.handleSelectRow(index) }
                        key={ index } />
        })
    }

    render() {
        let rows = this.createAdvisorReportsRows(this.state.data)
        let showRows = (this.props.filterText) ? this.search(rows, this.props.filterText) : rows
        return(
            <div className="organization-advisors-table">
                <Table striped bordered condensed hover responsive>
                    <caption>Shows reports submitted and engagements attended per week by an organizations' advisors</caption>
                    <AdvisorReportsTableHead
                        columnGroups={ this.props.columnGroups }
                        title="Organization name" 
                        onSelectAllRows={ this.handleSelectAllRows } />
                    <tbody>
                        { showRows }
                    </tbody>
                </Table>
            </div>
        )
    }
}

OrganizationAdvisorsTable.propTypes = {
    columnGroups: PropTypes.array.isRequired,
    filterText: PropTypes.string,
    onRowSelection: PropTypes.func,
}

export default OrganizationAdvisorsTable
