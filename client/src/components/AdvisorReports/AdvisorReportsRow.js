import React from 'react'
import Checkbox from 'components/Checkbox'

const _advisorStats = (statistics) => {
    let stats = []
    statistics.forEach( (statistic) => {
        let keySubmitted = `submitted-${statistic.hash}`
        let keyAttended = `attended-${statistic.hash}`
        stats.push(<td key={keySubmitted}>{statistic.reportsSubmitted}</td>)
        stats.push(<td key={keyAttended}>{statistic.engagementsAttended}</td>)
    })
    return stats
}

const AdvisorReportsRow = (props) => {
    let statistics = _advisorStats(props.statistics)
    let checkbox = (props.onSelectRow) ? <td><Checkbox checked={ props.checked } onChange={ props.onSelectRow } /></td> : null
    let description = (props.handleOrganizationClick) ? props.link : props.name
    return (
        <tr>
            {checkbox}
            <td>{description}</td>
            {statistics}
        </tr>
    )
}

export default AdvisorReportsRow
