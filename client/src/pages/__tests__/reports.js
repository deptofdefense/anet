import React from 'react'
import ReactDOM from 'react-dom'
import ReportNew from 'pages/reports/New'

it('reports/new renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<ReportNew />, div)
})
