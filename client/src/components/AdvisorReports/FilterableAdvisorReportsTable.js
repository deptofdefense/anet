import React, { Component } from 'react'
import OrganizationAdvisorsTable from 'components/AdvisorReports/OrganizationAdvisorsTable'
import Toolbar from 'components/AdvisorReports/Toolbar'
import _debounce from 'lodash.debounce'
import moment from 'moment'

import API from 'api'

const DEFAULT_WEEKS_AGO = 3
const advisorReportsQueryUrl = `/api/reports/insights/advisors` // ?weeksAgo=3 default set at 3 weeks ago

class FilterableAdvisorReportsTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            filterText: '',
            export: false,
            data: [],
            selectedData: []
        }
        this.handleFilterTextInput = this.handleFilterTextInput.bind(this)
        this.handleExportButtonClick = this.handleExportButtonClick.bind(this)
        this.handleRowSelection = this.handleRowSelection.bind(this)
    }

    componentDidMount() {
        let advisorReportsQuery = API.fetch(advisorReportsQueryUrl)
        Promise.resolve(advisorReportsQuery).then(value => {
            this.setState({
                data: value
            })
        })
    }

    handleFilterTextInput(filterText) {
        this.setState({ filterText: filterText })
    }

    handleExportButtonClick() {
        let selectedData = this.state.selectedData
        let allData = this.state.data
        let exportData = (selectedData.length > 0) ? selectedData : allData
        console.log(exportData)
    }

    handleRowSelection(data) {
        this.setState({ selectedData: data })
    }

    getWeekColumns() {
        const dateEnd = moment().startOf('week')
        const dateStart = moment().startOf('week').subtract(DEFAULT_WEEKS_AGO, 'weeks')
        let currentDate = dateStart
        let weekColumns = []
        while(currentDate.isBefore(dateEnd)) {
            weekColumns.push(currentDate.week())
            currentDate = currentDate.add(1, 'weeks')
        }
        return weekColumns
    }

    render() {
        const handleFilterTextInput = _debounce( (filterText) => {this.handleFilterTextInput(filterText) }, 300)
        const columnGroups = this.getWeekColumns()
        return (
            <div>
                <Toolbar 
                    onFilterTextInput={ handleFilterTextInput }
                    onExportButtonClick={ this.handleExportButtonClick } />
                <OrganizationAdvisorsTable
                    data={ this.state.data }
                    columnGroups={ columnGroups }
                    filterText={ this.state.filterText }
                    onRowSelection={ this.handleRowSelection } />
            </div>
        )
    }
}

export default FilterableAdvisorReportsTable
