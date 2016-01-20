import L from 'leaflet';

let app = {};

app.dispatchEvent = function(eventName, data){
  var event = document.createEvent('CustomEvent');
  event.initCustomEvent(eventName, true, false, data);
  document.dispatchEvent(event);
};

var map = new L.Map('map').setView([37.75, -122.23], 10);

L.Icon.Default.imagePath = '/images';
var tiles = new L.TileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
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
