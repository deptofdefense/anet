import React from 'react'
import Checkbox from 'components/Checkbox'

const _advisorStats = (columnGroups, statistics) => {
    let stats = []
    columnGroups.forEach( (group, index) => {
        let rowCell = statistics[index]
        if(rowCell){
            let keySubmitted = 1 //`submitted-${statistic.hash}`
            let keyAttended = 2 //`attended-${statistic.hash}`
            stats.push(<td key={ keySubmitted }>{ rowCell.nrreportssubmitted }</td>)
            stats.push(<td key={ keyAttended }>{ rowCell.nrengagementsattended }</td>)
        }
        else {
            stats.push(<td>0</td>)
            stats.push(<td>0</td>)
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
