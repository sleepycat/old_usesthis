import URITemplate from 'urijs/src/URITemplate'
import fetch from 'isomorphic-fetch'

class Geocoder {

  constructor() {
  }

  static geocode(location) {
    //Geocoder.ca:
    //let uriTemplate = new URITemplate('https://geocoder.ca/?json=1&locate={location}');
    let uriTemplate = new URITemplate('https://nominatim.openstreetmap.org/?format=json&q={location}&limit=1');
    let uri = uriTemplate.expand({location: location})

    let result = new Promise((resolve, reject) => {
      fetch(uri, {mode: 'cors'})
      .then((response) => { return response.json() })
      .then((json) => {
        //Geocoder.ca:
        //return resolve({lat: parseFloat(json.latt), lng: parseFloat(json.longt)})
        return resolve({lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon)})
      })
    })
    .catch((response) => { throw new Error("Unable to geocode that address.") })
    return result
  }

}

export default Geocoder
