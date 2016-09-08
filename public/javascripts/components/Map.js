import Lokka from 'lokka'
import Transport from 'lokka-transport-http'
import React, { PropTypes } from 'react'
import equal from 'deep-equal'
import ReactDOM from 'react-dom'
import isMobile from 'ismobilejs'
import mapboxgl from 'mapbox-gl'
import Geocoder from 'mapbox-gl-geocoder'
import Flash from 'mapbox-gl-flash'
import differenceby from 'lodash.differenceby'

const client = new Lokka({ transport: new Transport('/graphql') })

class Map extends React.Component {

  constructor(props){
    super(props)
  }

  static propTypes = {
    accessToken: PropTypes.string.isRequired,
    data: PropTypes.object
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
        trackResize: true
    });

    map.component = this
    this.map = map

    map.addControl(new Geocoder({
      container: 'geocoder-container',
      placeholder: 'Zoom to your city'
    }));


    map.addControl(new Flash());
    if(!isMobile.any){
      map.addControl(new mapboxgl.Navigation());
    }

    map.on("click", this.handleClick);

    let getBounds = (e) => {
      let bounds = e.target.getBounds()
      let boundsObj = {
        'neLat': bounds.getNorthEast().lat,
        'neLng': bounds.getNorthEast().lng,
        'swLat': bounds.getSouthWest().lat,
        'swLng': bounds.getSouthWest().lng,
        'center': e.target.getCenter(),
        'zoom': e.target.getZoom()
      }
      this.props.onBoundsChange(boundsObj)

      //TODO: is new data needed?
    }

    //Use touchend on mobile
    //otherwise you get WAY to many events
    if(isMobile.any){
      map.on("touchend", getBounds);
    } else {
      map.on("moveend", getBounds);
    }

    map.on("load", getBounds);
    window.map = map
  }


  addDataLayerToMap(data) {

      if(!(data.features === [])){
        try {
          this.map.removeLayer("markers")
          this.map.removeLayer("selected")
          this.map.removeSource("markers")
        }
        catch (e){
          // move along. Nothing to see here.
        }

        this.map.addSource("markers", {
          "type": "geojson",
          "data": data
        });


        this.map.addLayer({
          "id": "markers",
          "type": "symbol",
          "interactive": true,
          "source": "markers",
          "paint": {
          },
          "layout": {
            "icon-image": "marker-stroked-24",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
          }
        });


        this.map.addLayer({
          "id": "selected",
          "type": "symbol",
          "interactive": true,
          "source": "markers",
          "filter": ["==", this.props.highlight, true],
          "paint": {
            "icon-color": "#0000ff" //XXX: why does this not work?
          },
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
    let currentHighlight = this.props.highlight
    //If the URL was set by this.props.router.push above
    //nextProps and the current map state would be the same
    if(!(lat === center.lat && lng === center.lng && nextZoom == currentZoom )){
      //Out of sync, so the URL is being set by the user pushing
      //back/forward buttons
      this.map.jumpTo({center: new mapboxgl.LngLat(lng, lat), zoom: nextZoom})
    }

    if(differenceby(nextProps.data.features, this.props.data.features, (x)=> x.properties.address).length !== 0){
      this.addDataLayerToMap(nextProps.data)
    }

    if(nextProps.highlight !==  currentHighlight){
      this.map.setFilter("selected", ["==", nextProps.highlight, true])
    }


    return false
  }


  handleClick(e) {
    let map = e.target

    let features = map.queryRenderedFeatures(e.point, { layer: ['markers', 'selected'] })

    // Features is an array of things found near the click.
    // Since it can return map features as well as data from layers we
    // need to check if the source is mapbox.
    if (features.length > 0 && features[0].layer.source !== 'mapbox') {
      // send location id to owner
      this.component.props.showOrganizationProfile(features[0].properties.id)
    }

  }

  render() {

    return (
      <div ref={(el) => this.element = el} style={ this.props.style }></div>
    )
  }
}


export default Map;
