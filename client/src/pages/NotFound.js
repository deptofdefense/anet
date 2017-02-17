import React from 'react'
import Page from 'components/Page'

export default class NotFound extends Page {
    static pageProps = {
         useNavigation: false
 	}
    
	render() {
		return <div className="not-found">
            <h1>404 Not Found</h1>
        </div>
	}
}
