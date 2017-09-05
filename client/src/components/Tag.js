import React from 'react'
import {Label} from 'react-bootstrap'

const Tag = ({tag}) => (
  <Label bsStyle="info">{tag.name}</Label>
)
    
export default Tag
