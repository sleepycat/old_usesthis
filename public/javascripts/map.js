import L from 'leaflet';
import Lokka from 'lokka'
import Transport from 'lokka-transport-http'

const client = new Lokka({
    transport: new Transport('/graphql')
});

let map = new L.Map('map', {zoomControl: false})
let osmUrl = 'https://{s}.tiles.mapbox.com/v3/mikewilliamson.ic5f5glj/{z}/{x}/{y}.png';
let tiles = new L.TileLayer(osmUrl, { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
L.Icon.Default.imagePath = '/images';

new L.Control.Zoom({ position: 'topright' }).addTo(map);
map.markersLayer = new L.FeatureGroup();

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
        }
      }
  `, {neLat, neLng, swLat, swLng}).then(result => {
    map.markersLayer.clearLayers();
    result.locations_within_bounds.map((location) => {
      map.markersLayer.addLayer(L.marker([location.lat, location.lng]).bindPopup(location.address))
    })
    map.markersLayer.addTo(map);
  });
})

export default map;



