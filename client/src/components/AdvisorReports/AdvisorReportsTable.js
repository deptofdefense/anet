import React from 'react'
import { Table } from 'react-bootstrap'
import AdvisorReportsTableHead from 'components/AdvisorReports/AdvisorReportsTableHead'
import AdvisorReportsRow from 'components/AdvisorReports/AdvisorReportsRow'

const AdvisorReportsTable = (props) => {
    let rows = props.data.map( (advisor) => {
        return (<AdvisorReportsRow 
            row={ advisor }
            columnGroups={ props.columnGroups }
            key={ advisor.id } />)
    })
    return(
        <Table striped bordered condensed hover responsive>
            <caption>Shows reports submitted and engagements attended per week for each advisor in the organization</caption>
            <AdvisorReportsTableHead 
                title="Advisor name" 
                columnGroups={ props.columnGroups } />
            <tbody>
                { rows }
            </tbody>
        </Table>
    ) 
}

export default AdvisorReportsTable
