import React from 'react'
import NotFound from 'components/NotFound'
import API from 'api'
import _get from 'lodash.get'

export default WrappedPage => {
    return class ModelPage extends React.Component {
        static pageProps = {}

        constructor() {
            super()
            this.state = {}

            const modelPageThis = this

            Object.assign(ModelPage.pageProps, WrappedPage.pageProps)

            const origLoadData = WrappedPage.prototype.loadData
            WrappedPage.prototype.loadData = function(props) {
                origLoadData.call(this, props)
                let promise = API.inProgress
                if (promise && promise instanceof Promise) {

                    function onRequestNot404() {
                        Object.assign(ModelPage.pageProps, WrappedPage.pageProps)
                        modelPageThis.setState({notFound: false})
                    }

                    promise.then(
                        onRequestNot404,
                        err => {
                            if (err.status === 404 || 
                                    (err.status === 500 && _get(err, ['errors', 0]) === 'Invalid Syntax')) {
                                Object.assign(ModelPage.pageProps, {fluidContainer: true, useNavigation: false})
                                modelPageThis.setState({notFound: true})
                            } else {
                                onRequestNot404()
                            }
                        }
                    )
                }
            }
        }

        render() {
            const modelName = WrappedPage.modelName || 'Entry'
            if (this.state.notFound) {
                return <NotFound text={`${modelName} with ID ${this.props.params.id} not found.`} />
            }

            return <WrappedPage {...this.props} />
        }
    }
}
