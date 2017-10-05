import React from 'react'
import Checkbox from 'components/Checkbox'
import _uniqueId from 'lodash.uniqueid'

const _advisorStats = (columnGroups, statistics) => {
    let stats = []
    columnGroups.forEach( (group, index) => {
        let rowCell = statistics[index]
        let keySubmitted = _uniqueId('submitted_')
        let keyAttended = _uniqueId('attended_')
        if(rowCell){
            stats.push(<td key={ keySubmitted }>{ rowCell.nrreportssubmitted }</td>)
            stats.push(<td key={ keyAttended }>{ rowCell.nrengagementsattended }</td>)
        }
        else {
            stats.push(<td key={ keySubmitted }>0</td>)
            stats.push(<td key={ keyAttended }>0</td>)
        }
    })
    return stats
}

const AdvisorReportsRow = (props) => {
    let statistics = _advisorStats(props.columnGroups, props.row.stats)
    let checkbox = (props.onSelectRow) ? <td><Checkbox checked={ props.checked } onChange={ props.onSelectRow } /></td> : null
    let description = (props.handleOrganizationClick) ? props.link : props.row.name
    return (
        <tr>
            {checkbox}
            <td>{description}</td>
            {statistics}
        </tr>
    )
}

export default AdvisorReportsRow
