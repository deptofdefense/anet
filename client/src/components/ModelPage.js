import React from 'react'
import NotFound from 'components/NotFound'
import API from 'api'

export default WrappedPage => {
    const origLoadData = WrappedPage.prototype.loadData
    WrappedPage.prototype.loadData = props => {
        origLoadData()
        let promise = API.inProgress
        if (promise && promise instanceof Promise) {
            debugger
        }
    }

    return class ModelPage extends React.Component {
        render() {
            const modelName = WrappedPage.modelName() || 'Entry'
            if (this.state.notFound) {
                return <NotFound text={`${modelName} with ID ${this.props.params.id} not found.`} />
            }

            return <WrappedPage {...this.props} />
        }
    }
}