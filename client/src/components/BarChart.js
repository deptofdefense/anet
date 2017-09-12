import React, { Component } from 'react'

var d3 = require('d3')

export default class BarChart extends Component {
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
    console.log(this.props.data)
    const BAR_PADDING = 8
    const MARGIN = {top: 20, right: 20, bottom: 150, left: 20}
    const barWidth = this.props.size[0] / this.props.data.length - BAR_PADDING
    let node = this.node
    let width = node.clientWidth - MARGIN.left - MARGIN.right
    let height = node.clientHeight - MARGIN.top - MARGIN.bottom

    let graphData = this.props.data
    let graph = d3.select(node)
    
    let xScale = d3.scaleBand()
            .domain(this.props.data.map(d => d.org.shortName))
            .range([0, width])
    let yScale = d3.scaleLinear()
            .domain([1,100])
            .range([0, height])
    let xAxis = d3.axisBottom(yScale)
//            graph.append('g').call(xAxis)  
    graph.append('g')
        .attr("class", "xaxis axis")  // two classes, one for css formatting, one for selection below
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)          
/*
    graph.selectAll('*').remove()

    graph.attr('width', width + MARGIN.left + MARGIN.right)
         .attr('height', height + MARGIN.top + MARGIN.bottom)
         .append('g')
         .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)  

    let xAxis = d3.axisBottom(xScale)
    let yAxis = d3.axisLeft(yScale)    
    
    // Add x-axis
    graph.append('g').call(xAxis)
    graph.append('g').call(yAxis)

    // Add a bar for each data element
    graph.selectAll('rect')
         .data(graphData)
         .enter()
         .append('rect')
    graph.selectAll('rect')
         .data(graphData)
         .exit()
         .remove()
   
    graph.selectAll('rect')
         .data(this.props.data)
         .style('fill', '#fe9922')
         .attr('x', (d,i) => i * barWidth)
         .attr('y', d => d.released)
         .attr('height', d => yScale(d))
         .attr('width', 25)
         .style("stroke", "black")
         .style("stroke-opacity", 0.25)      
  */
   }

  render() {
    return <svg ref={node => this.node = node} width={500} height={500}></svg>
   }
}
