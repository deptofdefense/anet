import React from 'react'
import Page from 'components/Page'
import NotFound from 'components/NotFound'

export default class PageMissing extends Page {
    static pageProps = {
        useGrid: false
    }

	render() {
		return <NotFound notFoundText="404 Not Found" />
	}
}
