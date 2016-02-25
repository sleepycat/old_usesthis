import Lokka from 'lokka'
import Transport from 'lokka-transport-http'
import summary from './summary'
import d3 from 'd3'
import mapboxgl from 'mapbox-gl'
import Convert from './convert'

const client = new Lokka({ transport: new Transport('/graphql') })

mapboxgl.accessToken = 'pk.eyJ1IjoibWlrZXdpbGxpYW1zb24iLCJhIjoibzRCYUlGSSJ9.QGvlt6Opm5futGhE5i-1kw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mikewilliamson/cil16fkvv008oavm1zj3f4zyu',
    center: [-122.27593323274039, 37.66552780572411],
    zoom: 10.006562529849507
});

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

let updateSummary = (rawData) => {
  let data = summary(rawData)
  var center = map.getCenter();
  var sw_corner = map.getBounds().getSouthWest();
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

map.addControl(new mapboxgl.Navigation());

let getLocationsWithinBounds = (map) => {
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
	    name
	    technologies {
	      name
	    }
	  }
	}
      }
  `, {neLat, neLng, swLat, swLng}).then(result => {
    //XXX: api is restricted by area. Check for errors!
    updateSummary(result.locations_within_bounds)

    map.addSource("markers", {
      "type": "geojson",
      "data": Convert.toGeojson(result.locations_within_bounds)
    });

    map.addLayer({
      "id": "markers",
      "type": "symbol",
      "interactive": true,
      "source": "markers",
      "layout": {
	"icon-image": "{marker-symbol}-24",
	"text-field": "{title}",
	"text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
	"text-offset": [0, 0.6],
	"text-anchor": "top"
      }
    });
  })
}

map.on('moveend', (e) => {
  //console.log(`Map Center: ${JSON.stringify(map.getCenter())} zoom: ${map.getZoom()}`)
  map.removeLayer("markers")
  map.removeSource("markers")
  getLocationsWithinBounds(map)
});

map.on('load', function () {
  getLocationsWithinBounds(map)
});

map.on('click', (e) => {
    console.log(e)
    map.featuresAt(e.point, {
        radius: 7.5, // Half the marker size (15px).
        includeGeometry: true,
        layer: 'markers'
    }, function (err, features) {

        if (err || !features.length) {
            return;
        }

	let detailDiv = document.querySelector('#detail');
	while(detailDiv.firstChild){
	  detailDiv.removeChild(detailDiv.firstChild);
	}
	features.forEach((feature, index, array) => {
	  if(feature.properties) {
	    feature.properties.organizations.forEach((org, i, arr) => {
	      detailDiv.appendChild(createOrganizationView(org));
	    })
	  }
	});


    });
});

export default map;
