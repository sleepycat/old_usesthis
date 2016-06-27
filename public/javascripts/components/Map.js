import Lokka from 'lokka'
import Transport from 'lokka-transport-http'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import isMobile from 'ismobilejs'
import mapboxgl from 'mapbox-gl'
import Geocoder from 'imports?mapboxgl=mapbox-gl!../mapbox-gl-geocoder'
import Convert from '../convert'
import Flash from 'mapbox-gl-flash'

const client = new Lokka({ transport: new Transport('/graphql') })

class Map extends React.Component {

  constructor(props){
    super(props)
  }

  state = {}

  static propTypes = {
    accessToken: PropTypes.string.isRequired,
    data: PropTypes.array
  }

  componentDidMount() {

    const {
      styleURI,
      accessToken,
      center,
      zoom,
      onClick,
      onLoad,
      onMoveEnd
    } = this.props;


    mapboxgl.accessToken = accessToken
    let map = new mapboxgl.Map({
	container: this.element,
	style: styleURI,
	center: center,
	zoom: zoom,
    });

    map.component = this
    this.map = map

    map.addControl(new Geocoder({
      container: 'geocoder-container',
      placeholder: 'Zoom to your city'
    }));

    map.addControl(new Flash());
    map.addControl(new mapboxgl.Navigation());

    map.on("click", this.handleClick);

    //Use touchend on mobile
    //otherwise you get WAY to many events
    if(isMobile.any){
      map.on("touchend", this.getLocationsWithinBounds);
    } else {
      map.on("moveend", this.getLocationsWithinBounds);
    }

    map.on("load", this.getLocationsWithinBounds);

    map.on('style.load', (e) => {
      this.setState({ map });
    })

  }

  dispatchEvent(eventName, data) {
    let event = document.createEvent('CustomEvent')
    event.initCustomEvent(eventName, true, false, data)
    document.dispatchEvent(event)
  }

  addDataLayerToMap(data) {

      if(!(data === [])){
        try {
          this.map.removeLayer("markers")
          this.map.removeSource("markers")
        }
        catch (e){
          // move along. Nothing to see here.
        }

        this.map.addSource("markers", {
          "type": "geojson",
          "data": Convert.toGeojson(data)
        });

        this.map.addLayer({
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
      }
  }

  shouldComponentUpdate(nextProps, nextState) {
    let center = this.map.getCenter()
    let currentZoom = this.map.getZoom()
    let nextZoom = parseFloat(nextProps.zoom)
    let lat = parseFloat(nextProps.center[1])
    let lng = parseFloat(nextProps.center[0])
    //If the URL was set by this.props.router.push above
    //nextProps and the current map state would be the same
    if(!(lat === center.lat && lng === center.lng && nextZoom == currentZoom)){
      //Out of sync, so the URL is being set by the user pushing
      //back/forward buttons
      this.map.jumpTo({center: new mapboxgl.LngLat(lng, lat), zoom: nextZoom})
    }
    return false
  }

  getLocationsWithinBounds(e) {
    //Beacuse this is an event handler `this` is the map not the <Map> component
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
      `, {neLat, neLng, swLat, swLng}).then((result) => {
      //Update the map to display the new data
      this.component.addDataLayerToMap(result.locations_within_bounds)
      //Give the data to our owning component
      this.component.props.passDataToParent(result.locations_within_bounds)
    }, (e) => {
      this.component.dispatchEvent('mapbox.setflash', {message: e.message.split(':')[1], info: true, fadeout: 3})
    })
      this.component.props.router.push(`/map=${this.getZoom()}/${this.getCenter().lat}/${map.getCenter().lng}`)
  }

  handleClick(e) {
    let map = e.target

    let features = map.queryRenderedFeatures(e.point, { layer: ['markers'] })

    if (features[0].layer.id == 'markers') {
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
         //pass the organizations to the owner so it can
         // render the org profile
         this.component.props.showOrganizationProfile(result.location.organizations)
      }, (e) => {
        this.component.dispatchEvent('mapbox.setflash', {message: e.message.split(':')[1], info: true, fadeout: 3})
      });
    }

  }

  render() {

    let styles = {
      zIndex: 0,
      height: '100vh',
      width: '100%'
    }

    return (
      <div>
        <div ref={(el) => this.element = el} style={ styles }></div>
      </div>
    )
  }
}


export default Map;
