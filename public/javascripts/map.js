import L from 'leaflet';
import Lokka from 'lokka'
import Transport from 'lokka-transport-http'
import summary from './summary'
import d3 from 'd3'

const client = new Lokka({
    transport: new Transport('/graphql')
});

let map = new L.Map('map', {zoomControl: false})
let osmUrl = 'https://{s}.tiles.mapbox.com/v3/mikewilliamson.ic5f5glj/{z}/{x}/{y}.png';
let tiles = new L.TileLayer(osmUrl, { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
L.Icon.Default.imagePath = '/images';

new L.Control.Zoom({ position: 'topright' }).addTo(map);
map.markersLayer = new L.FeatureGroup();

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

map.on('moveend', () => {
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
    map.markersLayer.clearLayers();
    result.locations_within_bounds.map((location) => {
      map.markersLayer.addLayer(L.marker([location.lat, location.lng]).bindPopup(location.address))
    })
    map.markersLayer.addTo(map);
    updateSummary(result.locations_within_bounds)
  });
})



export default map;



