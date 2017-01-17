import React from 'react'
import Page from 'components/Page'
import {DropdownButton, MenuItem} from 'react-bootstrap'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import LinkTo from 'components/LinkTo'
import autobind from 'autobind-decorator'
import History from 'components/History'
import moment from 'moment'

import API from 'api'
import {Poam} from 'models'
import * as d3 from 'd3'

export default class RollupShow extends Page {
	static contextTypes = {
		app: React.PropTypes.object.isRequired,
	}
	static propTypes = {
		date : React.PropTypes.object
	}
	static stateTypes = {
		reports : React.PropTypes.object
	}
	static defaultProps = {
		date : moment()
	}
	constructor(props) {
		super(props)
		this.state = {
			date : {},
			reports : {}
		}
	}
	get dateStr(){ return this.props.date.format('YYYY-MM-DD') }
	get dateLongStr() { return this.props.date.format('MMMM DD, YYYY') }
	get rollupStart() { return this.props.date.startOf('day') }
	get rollupEnd() { return this.props.date.endOf('day') }

	fetchData(props) {
		// TODO
		API.query(/* GraphQL */`
				{
  reports(f:getAll,pageSize:20,pageNum:0){
    state
    intent
    advisorOrg {
      id
      shortName
      parentOrg {
        id
        shortName
      }
    }
  }
}
`)
	}

	render() {
		let {reports} = this.state
		// Admins can edit poams, or super users if this poam is assigned to their org.
		let currentUser = this.context.app.state.currentUser
		let canEdit = (currentUser && currentUser.isAdmin())
			// || (currentUser && poam.responsibleOrg && currentUser.isSuperUserForOrg(poam.responsibleOrg));

		// let dateStrS = moment().format('YYYY-MM-DD')
		
		// Sets up the data
		var step1 = d3.nest()
				.key(function(d){return d.advisorOrg.parentOrg.shortName;})
				.rollup(function(d){return {l:d.length,s:d[0].state,r:d}})
				.entries(reports)

				// TODO: this is imperative, should probably use 
				// something like
				// var svg = ReactFauxDOM.createElement('ul')
				// d3.select(svg)
				// ... lots of code
				// var reactDOM =  list.toReact()
				// http://oli.me.uk/2015/09/09/d3-within-react-the-right-way/
		var svg = d3.select("svg"), 
			margin = {top: 20, right: 20, bottom: 20, left: 20},
			width = +svg.attr("width") - margin.left - margin.right,
			height = +svg.attr("height") - margin.top - margin.bottom,
			padding = 22,
			g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var x = d3.scaleBand().rangeRound([0,width])

		var y = d3.scaleLinear()
			.rangeRound([height, 0]);

		x.domain(step1.map(function(d){return d.key}));
		y.domain([0,d3.max(step1.map(function(d){return d.value.l}))]);
		var line = d3.line()
			.x(function(d,i) { return x(d.key); })
			.y(function(d,i) { return y(d.value); });

		var xAxis = d3.axisBottom()
			.scale(x);
		var maxValue = d3.max(step1.map(function(d){
					return d.value.l
				  }));
		var yAxis = d3.axisLeft()
			.scale(y).ticks(Math.min(maxValue+1,10));

		g.append("g")
			.attr("transform", "translate(0," + height + ")")
			.attr("fill", "#000")
			.call(xAxis);

		g.append("g")
			.attr("fill", "#400")
			.call(yAxis)
			.append("text")
			.attr("fill", "#000")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.style("text-anchor", "end")
			.text("# of Reports");

		g.selectAll(".bar")
			.data(step1)
			.enter().append("rect")
			.attr("class", "line")
			.attr("width", width / step1.length - padding )
			.attr("x",function(d,i){return x(d.key) + (width / (step1.length + padding))})
			.attr("height", function(d,i){return height - y(d.value.l)})
			.attr("y",function(d,i){return y(d.value.l) })
			.attr("fill", function(d){return "green";})
		;

		return (
			<div>
				<Breadcrumbs items={[['Rollup',''],[this.dateStr,'rollup/' +this.dateStr]]} />

				{canEdit &&
					<div className="pull-right">
						<DropdownButton bsStyle="primary" title="Actions" id="actions" className="pull-right" onSelect={this.actionSelect}>
							<MenuItem eventKey="edit" >Edit</MenuItem>
						</DropdownButton>
					</div>
				}

				<Form static formFor={reports} horizontal>
					<fieldset>
						<legend>Daily Rollup - {this.dateLongStr}</legend>
						<div className="todo" contentEditable suppressContentEditableWarning>Some introductory text regarding {reports && reports.reports && reports.reports.length} reports, using 230 days due to SQLite issues.</div>
					</fieldset>
					<fieldset>
						<legend>Summary of Report Input</legend>
						<svg>
						</svg>
						<div className="todo" contentEditable suppressContentEditableWarning>Pretty graphs here</div>
					</fieldset>
					<fieldset>
						<legend>Report of the Day</legend>
						<div className="todo" contentEditable suppressContentEditableWarning>Pretty graphs here</div>
					</fieldset>
					<fieldset>
						<legend>Reports - {this.dateLongStr}</legend>
						<div className="todo" contentEditable suppressContentEditableWarning>Pretty graphs here</div>
					</fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === "edit") {
			History.push(`/report/${this.state.report.id}/edit`);
		} else {
			console.log("Unimplemented Action: " + eventKey);
		}
	}
}
