import Lokka from 'lokka'
import ReactFauxDOM from 'react-faux-dom'
import d3 from 'd3'
import Transport from 'lokka-transport-http'
import summary from './summary'
import Convert from './convert'
import Map from './components/Map'
import React from 'react';
import ReactDOM from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'

let dispatchEvent = (eventName, data) => {
  let event = document.createEvent('CustomEvent');
  event.initCustomEvent(eventName, true, false, data);
  document.dispatchEvent(event);
};

const client = new Lokka({ transport: new Transport('/graphql') })



let updateSummary = (rawData) => {
  let data = summary(rawData)
  var sidebarWidth = parseInt(document.querySelector('#sidebar').offsetWidth) - 25;
  var barHeight = 20;

  var chart = d3.select(".chart")
  .attr("width", sidebarWidth)
  .attr("height", barHeight * 10 + 25)
  chart.select("g.axis")
  .attr({
    "transform": "translate(0,25)"
  });

    var xScale = d3.scale.linear()
    .domain([0, data.sample_size])
    .range([0, sidebarWidth - 10]);

    var bar = chart.selectAll("g.bar")
    .data(data.summary);

    var xAxis = d3.svg.axis()
    .scale(xScale)
    .tickFormat(d3.format('d'))
    .orient("top");


    var g = bar.enter()
    .append("g")
    .attr({
      "transform": function(d, i) { return "translate(0," + ((i * barHeight) + 26) + ")"; },
      "class": "bar"
    });

    d3.select(".axis").transition().call(xAxis);

    g.append("rect")
    .attr("class", "bar");

    g.append("text")
    .attr("class", "label");

    bar.select("rect")
    .attr("width", function(d){ return xScale(d.count); })
    .attr("height", barHeight - 1);

    bar.select("text")
    .attr("x", 5)
    .attr("y", barHeight / 2.1)
    .attr("dy", ".31em")
    .text(function(d) { return d.name; });

    bar.exit().remove();

};

let createOrganizationView = function(org){
  var div = document.createElement('div');
  div.className = 'organization-detail';
  var link = document.createElement('a');
  link.href = org.url;
  link.text = org.name;
  link.target = '_blank';
  var nameP = document.createElement('p');
  nameP.appendChild(link);
  var techList = document.createElement('ul');
  org.technologies.forEach(function(element, index, array){
    var li = document.createElement('li');
    li.innerHTML = element.name;
    li.className = 'technology';
    techList.appendChild(li);
  });
  div.appendChild(nameP);
  div.appendChild(techList);
  return div;
};


let mapClickHandler = (e) => {
  let map = e.target

  let features = map.queryRenderedFeatures(e.point, { layer: ['markers'] })

  if (!features.length) {
    return;
  }

  client.query(`
      query getLocation($id: ID!) {
	location(id: $id){
	  organizations {
            url
	    name
	    technologies {
	      name
	    }
	  }
	}
      }
  `, {id: features[0].properties.id}).then(result => {
      //TODO: we are only displaying the first result here.
      let detailDiv = document.querySelector('#detail');
      while(detailDiv.firstChild){
        detailDiv.removeChild(detailDiv.firstChild);
      }
      result.location.organizations.forEach((org, i, arr) => {
        detailDiv.appendChild(createOrganizationView(org));
      })
  }, (e) => {
    dispatchEvent('mapbox.setflash', {message: e.message.split(':')[1], info: true, fadeout: 3})
  });
}

class App extends React.Component {

  state = { mapData: [] }



  getLocationsWithinBounds(e) {
    let map = this
    let bounds = map.getBounds()

    let neLat = bounds.getNorthEast().lat;
    let neLng = bounds.getNorthEast().lng;
    let swLat = bounds.getSouthWest().lat;
    let swLng = bounds.getSouthWest().lng;

    client.query(`
	query getLocations($neLat: Float, $neLng: Float, $swLat: Float, $swLng: Float) {
	  locations_within_bounds(ne_lat: $neLat, ne_lng: $neLng, sw_lat: $swLat, sw_lng: $swLng){
	    id
	    lat
	    lng
	    address
	    organizations {
	      url
	      name
	      technologies {
		name
	      }
	    }
	  }
	}
      `, {neLat, neLng, swLat, swLng}).then(result => {

      this.component().props.updateMapData(result.locations_within_bounds)

    }, (e) => {
      //TODO: move to Map component
      dispatchEvent('mapbox.setflash', {message: e.message.split(':')[1], info: true, fadeout: 3})
    })
  }

  updateMapData(data) {
    return this.setState({mapData: data})
  }


  render() {
    return (
      <div>
	<div id="pullout_panel">
	  <div id="pullout_handle"></div>
	  <div id='detail'>
	    <p class="explanation">
	      Click one of the organizations on the map to see the details.
	    </p>
	  </div>
	</div>
	<section id="sidebar">
	  <div id='title'>
	    Usesth.is
	  </div>
	  <div id="geocoder-container"></div>
	  <svg class="chart">
	    <g class="axis"></g>
	  </svg>
	</section>
	<Map
	  accessToken='pk.eyJ1IjoibWlrZXdpbGxpYW1zb24iLCJhIjoibzRCYUlGSSJ9.QGvlt6Opm5futGhE5i-1kw'
	  styleURI='mapbox://styles/mikewilliamson/cil16fkvv008oavm1zj3f4zyu'
	  center= {[-122.27593323274039, 37.66552780572411]}
	  zoom={10.006562529849507}
	  onMoveEnd={this.getLocationsWithinBounds.bind(this)}
	  onLoad={this.getLocationsWithinBounds}
          onClick={mapClickHandler}
	  data={this.state.mapData}
          updateMapData={this.updateMapData.bind(this)}
        />
      </div>
    );
  }
}

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App}/>
  </Router>
), document.getElementById('app'))

let handle = document.querySelector("#pullout_handle")

let pulloutMenu = handle.parentElement

let moveFunction = function(e){
  pulloutMenu.style.transform = `translateX(${e.touches[0].pageX - screen.width}px)`
}

handle.addEventListener("touchstart", function(e){
  console.log(e)
  handle.addEventListener('touchmove', moveFunction)
})

handle.addEventListener("touchend", function(e){
  console.log(e)
  handle.removeEventListener('touchmove', moveFunction)
})
