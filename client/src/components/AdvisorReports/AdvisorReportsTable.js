import React from 'react'
import { Table } from 'react-bootstrap'
import AdvisorReportsTableHead from 'components/AdvisorReports/AdvisorReportsTableHead'
import AdvisorReportsRow from 'components/AdvisorReports/AdvisorReportsRow'

const AdvisorReportsTable = (props) => {
    let rows = props.data.map( (advisor) => {
        return (<AdvisorReportsRow 
            id={ advisor.id }
            name={ advisor.name } 
            statistics={ advisor.statistics }
            selectable={ props.selectable }
            checked={ props.allSelected }
            key={ advisor.id } />)
    })

    return(
        <Table striped bordered condensed hover responsive>
            <AdvisorReportsTableHead 
                title="Advisor name" 
                columnGroups={ props.columnGroups } 
                selectable={ props.selectable }/>
            <tbody>
                { rows }
            </tbody>
        </Table>
    ) 
}

export default AdvisorReportsTable
