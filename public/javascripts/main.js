import L from 'leaflet';

let app = {};

app.dispatchEvent = function(eventName, data){
  var event = document.createEvent('CustomEvent');
  event.initCustomEvent(eventName, true, false, data);
  document.dispatchEvent(event);
};

var map = new L.Map('map', {zoomControl: false}).setView([37.75, -122.23], 10);

L.Icon.Default.imagePath = '/images';
  new L.Control.Zoom({ position: 'topright' }).addTo(map);
  let osmUrl = 'https://{s}.tiles.mapbox.com/v3/mikewilliamson.ic5f5glj/{z}/{x}/{y}.png';
var tiles = new L.TileLayer(osmUrl, {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


import Lokka from 'lokka'
import Transport from 'lokka-transport-http'

const client = new Lokka({
    transport: new Transport('/graphql')
});

client.query(`
    {
      locations {
	id
	lat
	lng
	address
      }
    }
`).then(result => {
  result.locations.map((location) => {
     var marker = L.marker([location.lat, location.lng]).bindPopup(location.address).addTo(map);
  })
});
