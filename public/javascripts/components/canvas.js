import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import ReactFauxDOM from 'react-faux-dom'
import d3 from 'd3'

export default class SummaryChart extends Component {

  propTypes: {
    data: PropTypes.array
  }

  render() {
    //var data = this.props.data
    //  var data = {summary: [{name: "foo", count: 3}], sample_size: 50}

    //  var sidebarWidth =  100// parseInt(document.querySelector('#sidebar').offsetWidth) - 25;
    //  var barHeight = 20;

    //  const svg = new ReactFauxDOM.Element('svg')
    //  var chart = d3.select(svg)
    //  .attr("width", sidebarWidth)
    //  .attr("height", barHeight * 10 + 25)
    //  chart.select("g.axis")
    //  .attr({
    //    "transform": "translate(0,25)"
    //  });

    //  var xScale = d3.scale.linear()
    //  .domain([0, data.sample_size])
    //  .range([0, sidebarWidth - 10]);

    //  var bar = chart.selectAll("g.bar")
    //  .data(data.summary);

    //  var xAxis = d3.svg.axis()
    //  .scale(xScale)
    //  .tickFormat(d3.format('d'))
    //  .orient("top");

    //  var g = bar.enter()
    //  .append("g")
    //  .attr({
    //    "transform": function(d, i) { return "translate(0," + ((i * barHeight) + 26) + ")"; },
    //    "class": "bar"
    //  });

    //  d3.select(".axis").transition().call(xAxis);

    //  g.append("rect")
    //  .attr("class", "bar");

    //  g.append("text")
    //  .attr("class", "label");

    //  bar.select("rect")
    //  .attr("width", function(d){ return xScale(d.count); })
    //  .attr("height", barHeight - 1);

    //  bar.select("text")
    //  .attr("x", 5)
    //  .attr("y", barHeight / 2.1)
    //  .attr("dy", ".31em")
    //  .text(function(d) { return d.name; });

    //  return  chart.toReact()

    return (
      <div>
	<canvas ref="myCanvas" />
      </div>
    );
  }

  componentDidMount() {
    let data = [
      {name: 'javascript', count: '.08167'},
      {name: 'python', count: '.01492'},
      {name: 'java', count: '.02782'},
      {name: 'ruby', count: '.04253'},
      {name: 'c-sharp', count: '.12702'},
      {name: 'go', count: '.02288'},
      {name: 'scala', count: '.02015'}
    ]

    let canvas = ReactDOM.findDOMNode(this.refs.myCanvas);
    let context = canvas.getContext("2d");

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = canvas.width - margin.left - margin.right,
        height = canvas.height - margin.top - margin.bottom;

        var x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1);

        var y = d3.scaleLinear()
        .rangeRound([height, 0]);

        context.translate(margin.left, margin.top);

        x.domain(data.map(function(d) { return d.name; }));
        y.domain([0, d3.max(data, function(d) { return d.count; })]);

        var yTickCount = 10,
          yTicks = y.ticks(yTickCount),
            yTickFormat = y.tickFormat(yTickCount, "%");

            context.beginPath();
            x.domain().forEach(function(d) {
              context.moveTo(x(d) + x.bandwidth() / 2, height);
              context.lineTo(x(d) + x.bandwidth() / 2, height + 6);
            });
            context.strokeStyle = "black";
            context.stroke();

            context.textAlign = "center";
            context.textBaseline = "top";
            x.domain().forEach(function(d) {
              context.fillText(d, x(d) + x.bandwidth() / 2, height + 6);
            });

            context.beginPath();
            yTicks.forEach(function(d) {
              context.moveTo(0, y(d) + 0.5);
              context.lineTo(-6, y(d) + 0.5);
            });
            context.strokeStyle = "black";
            context.stroke();

            context.textAlign = "right";
            context.textBaseline = "middle";
            yTicks.forEach(function(d) {
              context.fillText(yTickFormat(d), -9, y(d));
            });

            context.beginPath();
            context.moveTo(-6.5, 0 + 0.5);
            context.lineTo(0.5, 0 + 0.5);
            context.lineTo(0.5, height + 0.5);
            context.lineTo(-6.5, height + 0.5);
            context.strokeStyle = "black";
            context.stroke();

            context.save();
            context.rotate(-Math.PI / 2);
            context.textAlign = "right";
            context.textBaseline = "top";
            context.font = "bold 10px sans-serif";
            context.fillText("Frequency", -10, 10);
            context.restore();

            context.fillStyle = "steelblue";
            data.forEach(function(d) {
              context.fillRect(x(d.name), y(d.count), x.bandwidth(), height - y(d.count));
            });
  }

}
