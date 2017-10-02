import React, { Component } from 'react'
import OrganizationAdvisorsTable from 'components/AdvisorReports/OrganizationAdvisorsTable'
import Toolbar from 'components/AdvisorReports/Toolbar'
import _debounce from 'lodash.debounce'

const WEEK_NUMBERS = [32, 31, 30]
const ORGANIZATIONS = [
    {name: 'Org Han Solo', stats: [
        {hash:1233, week: 32, reportsSubmitted: 65, engagementsAttended: 5},
        {hash:1234, week: 31, reportsSubmitted: 10, engagementsAttended: 15},
        {hash:1235, week: 30, reportsSubmitted: 32, engagementsAttended: 22}], id: 1},
    {name: 'Org Scott', stats: [
        {hash:1236, week: 32, reportsSubmitted: 20, engagementsAttended: 8},
        {hash:1237, week: 31, reportsSubmitted: 30, engagementsAttended: 15},
        {hash:1238, week: 30, reportsSubmitted: 82, engagementsAttended: 22}], id: 2},
    {name: 'Org Smith', stats: [
        {hash:1239, week:32, reportsSubmitted: 124, engagementsAttended: 35},
        {hash:12310, week: 31, reportsSubmitted: 31, engagementsAttended: 15},
        {hash:12311, week: 30, reportsSubmitted: 52, engagementsAttended: 22}], id: 3},
    ] // TODO implement dynamic data

class FilterableAdvisorReportsTable extends Component {
    constructor(props) {
        super(props)
        this.state = { filterText: '' }
        this.handleFilterTextInput = this.handleFilterTextInput.bind(this)
        this.handleExportButtonClick = this.handleExportButtonClick.bind(this)
    }

    handleFilterTextInput(filterText) {
        this.setState({ filterText: filterText })
    }

    handleExportButtonClick() {
        console.log('Clicked Export')
    }

    render() {
        const handleFilterTextInput = _debounce( (filterText) => {this.handleFilterTextInput(filterText) }, 300)
        return (
            <div>
                <Toolbar 
                    filterText={ this.state.filterText }
                    onFilterTextInput={ handleFilterTextInput }
                    onExportButtonClick={ this.handleExportButtonClick } />
                <OrganizationAdvisorsTable
                    data={ ORGANIZATIONS }
                    columnGroups={ WEEK_NUMBERS }
                    filterText={ this.state.filterText } />
            </div>
        )
    }
}

export default FilterableAdvisorReportsTable
