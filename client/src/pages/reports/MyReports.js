import React from 'react'
import Page from 'components/Page'
import Breadcrumbs from 'components/Breadcrumbs'

export default class MyReports extends Page {
    constructor() {
        super()
        this.state = {}
    }

    render() {
        return <div>
            <Breadcrumbs items={[['My Reports', window.location.pathname]]} />
        </div>
    }
}