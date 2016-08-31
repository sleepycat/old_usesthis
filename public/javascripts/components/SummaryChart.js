import React, { Component, PropTypes } from 'react'
import ReactFauxDOM from 'react-faux-dom'
import {format} from 'd3-format'
import {
  select,
  selectAll,
  attr,
  data
} from 'd3-selection'
import {
  scaleLinear,
  domain,
  range,
  nice
} from 'd3-scale'
import {
  axisBottom,
  scale,
  tickValues,
  tickFormat
} from 'd3-axis'
import {
  ticks,
} from 'd3-array'

export default class SummaryChart extends Component {

  propTypes: {
    data: PropTypes.array
  }

  render() {

    let chartComponent = this

    let data = this.props.data

    let sidebarWidth =  this.props.width
    let barHeight = 20;

    const svg = new ReactFauxDOM.Element('svg')
    let chart = select(svg)
      .attr("width", sidebarWidth)
      .attr("height", barHeight * 10 + 25);

    chart.select("g.axis").attr("transform", "translate(0,25)");

    let xScale = scaleLinear()
    .domain([0, data.sample_size])
    .range([0, sidebarWidth - 10])
    .nice()

    let bar = chart.selectAll("g.bar")
    .data(data.summary);

    let xAxis = axisBottom()
    .scale(xScale)

    if(data.sample_size < 8){
      xAxis.tickValues(ticks(0, data.sample_size, data.sample_size))
      .tickFormat(format('d'))
    }


    let g = bar.enter()
    .append("g")
    .attr("transform", (d, i) => { return "translate(0," + ((i * barHeight) + 26) + ")"; })

    g.append("rect")
    .attr("class", "bar")
    .attr("class", function(d){
      if(chartComponent.props.highlight == d.name) {
        return 'bar selected'
      } else {
        return 'bar'
      }
    })
    .attr("id", (d) => d.name)
    .attr("width", (d) => xScale(d.count))
    .attr("height", barHeight - 1)

    g.append("text")
    .attr("class", "bar_label")
    .attr("x", 5)
    .attr("cursor", "pointer")
    .attr("y", barHeight / 2.1)
    .attr("dy", ".31em")
    .on('click', function(data){
      chartComponent.props.labelOnClick(data.name)
    })
    .text((d) => d.name);

    chart.append('g')
        .call(xAxis)

    return svg.toReact()
  }

}
