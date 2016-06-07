import React, { Component, PropTypes } from 'react'
import ReactFauxDOM from 'react-faux-dom'
import d3 from 'd3'

export default class SummaryChart extends Component {

  propTypes: {
    data: PropTypes.array
  }

  render() {

    let data = this.props.data
    //TODO: make sure we have clean data here:

    let sidebarWidth =  this.props.width
    let barHeight = 20;

    const svg = new ReactFauxDOM.Element('svg')
    let chart = d3.select(svg)
      .attr("width", sidebarWidth)
      .attr("height", barHeight * 10 + 25);

    chart.select("g.axis").attr("transform", "translate(0,25)");

    let xScale = d3.scaleLinear()
    .domain([0, data.sample_size])
    .range([0, sidebarWidth - 10])
    .nice()

    let bar = chart.selectAll("g.bar")
    .data(data.summary);

    let xAxis = d3.axisBottom()
    .scale(xScale)

    if(data.sample_size < 8){
      xAxis.tickValues(d3.ticks(0, data.sample_size, data.sample_size))
      .tickFormat(d3.format('d'))
    }


    let g = bar.enter()
    .append("g")
    .attr("transform", (d, i) => { return "translate(0," + ((i * barHeight) + 26) + ")"; })
    .attr("class", "bar")


    g.append("rect")
    .attr("class", "bar")
    .attr("width", (d) => xScale(d.count))
    .attr("height", barHeight - 1);

    g.append("text")
    .attr("class", "label")
    .attr("x", 5)
    .attr("y", barHeight / 2.1)
    .attr("dy", ".31em")
    .text((d) => d.name);

    chart.append('g')
        .call(xAxis)

    return svg.toReact()
  }

}
