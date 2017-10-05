import React, { Component } from 'react'
import OrganizationAdvisorsTable from 'components/AdvisorReports/OrganizationAdvisorsTable'
import Toolbar from 'components/AdvisorReports/Toolbar'
import _debounce from 'lodash.debounce'

import API from 'api'

const WEEK_NUMBERS = [32, 31, 30]

const advisorReportsQueryUrl = `/api/reports/insights/advisors` // ?weeksAgo=3 default set at 3 weeks ago

class FilterableAdvisorReportsTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            filterText: '',
            data: []
        }
        this.handleFilterTextInput = this.handleFilterTextInput.bind(this)
        this.handleExportButtonClick = this.handleExportButtonClick.bind(this)
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
        console.log('Clicked Export')
    }

    render() {
        const handleFilterTextInput = _debounce( (filterText) => {this.handleFilterTextInput(filterText) }, 300)
        return (
            <div>
                <Toolbar 
                    onFilterTextInput={ handleFilterTextInput }
                    onExportButtonClick={ this.handleExportButtonClick } />
                <OrganizationAdvisorsTable
                    data={ this.state.data }
                    columnGroups={ WEEK_NUMBERS }
                    filterText={ this.state.filterText } />
            </div>
        )
    }
}

export default FilterableAdvisorReportsTable
