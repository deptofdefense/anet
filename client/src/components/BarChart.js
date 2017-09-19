import React, { Component, PropTypes } from 'react'

var d3 = require('d3')


/*
 * Given an object and a property of the type prop1.prop2.prop3,
 * return obj[prop1][prop2][prop3]
 */
function getPropValue(obj, prop) {  
  var getterDetails = [obj]
  var objProps = prop.split('.') 
  for (var i = 0; i < objProps.length; i++) {
    getterDetails.push(objProps[i])
  }
  return getterDetails.reduce(function(d, v) {
    return d[v]
  })  
}

export default class BarChart extends Component {
  static propTypes = {
    data: PropTypes.array,
    size: PropTypes.array,
    xProp: PropTypes.string.isRequired,
    yProp: PropTypes.string.isRequired,
    xLabel: PropTypes.string,
    barColor: PropTypes.string,
  }

  static defaultProps = {
    barColor: '#EC971F',
  }
  
  constructor(props){
    super(props)
    this.createBarChart = this.createBarChart.bind(this)
  }

  componentDidMount() {
    this.createBarChart()
  }

  componentDidUpdate() {
    this.createBarChart()
  }

  createBarChart() {
    const MARGIN = {top: 20, right: 20, bottom: 20, left: 50}
    let chartData = this.props.data
    let width = this.props.size[0] - MARGIN.left - MARGIN.right
    let height = this.props.size[1] - MARGIN.top - MARGIN.bottom
    let xProp = this.props.xProp  // data property to use for the x-axis domain
    let yProp = this.props.yProp  // data property to use for the y-axis domain
    let xLabel = this.props.xLabel || this.props.xProp  // data property to use for the x-axis ticks label
    var xLabels = {}

    let xScale = d3.scaleBand()
      .domain(chartData.map(function(d) { xLabels[getPropValue(d, xProp)] = getPropValue(d, xLabel); return getPropValue(d, xProp) }))
      .rangeRound([0, width])
      .padding(0.1)
    let yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, function(d) { return getPropValue(d, yProp) })])
      .range([height, 0])

    let xAxis = d3.axisBottom(xScale)
      .tickFormat(function(d) { return xLabels[d] })
    let yAxis = d3.axisLeft(yScale)

    let chart = d3.select(this.node)
    chart.selectAll('*').remove()
    chart = chart.attr('width', width + MARGIN.left + MARGIN.right)
      .attr('height', height + MARGIN.top + MARGIN.bottom)
      .append('g')
      .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)

    chart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
    chart.append('g').call(yAxis)

    let bar = chart.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('g')
      .classed('bar', true)

    bar.append('rect')
      .attr('x', function(d) { return xScale(getPropValue(d, xProp)) })
      .attr('y', function(d) { return yScale(getPropValue(d, yProp)) })
      .attr('width', xScale.bandwidth())
      .attr('height', function(d) { return height - yScale(getPropValue(d, yProp)) })
      .attr('fill', this.props.barColor)
   }

  render() {
    return <svg ref={node => this.node = node}></svg>
   }
}
