import React from 'react'
import SimpleModal from 'components/SimpleModal'
import AdvisorReportsTable from 'components/AdvisorReports/AdvisorReportsTable'

const AdvisorReportsModal = (props) => {
    return (
        <SimpleModal title={ props.name } >
            <AdvisorReportsTable 
                data={ props.data }
                columnGroups={ props.columnGroups}
                size="large" />
        </SimpleModal >
    )
}

export default AdvisorReportsModal
