import React from 'react'
import PropTypes from 'prop-types'
import equal from 'deep-equal'
import ReactDOM from 'react-dom'
import isMobile from 'ismobilejs'
import mapboxgl from 'mapbox-gl'
import Flash from 'mapbox-gl-flash'
import differenceby from 'lodash.differenceby'
import bboxPolygon from '@turf/bbox-polygon'
import inside from '@turf/inside'
import within from '@turf/within'
import explode from '@turf/explode'
import extent from 'turf-extent'
import { featureCollection } from '@turf/helpers'
var MapboxGeocoder = require('@mapbox/mapbox-gl-geocoder')

class Map extends React.Component {
  constructor(props) {
    super(props)
  }

  static propTypes = {
    accessToken: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    navigation: PropTypes.string,
    marker: PropTypes.string,
    selected: PropTypes.string,
    highlight: PropTypes.string,
    onBoundsChange: PropTypes.func,
    onDataNeeded: PropTypes.func,
    onClick: PropTypes.func,
  }

  makePolygons(currentBounds, previousBounds) {
    let currentPolygon = bboxPolygon([
      currentBounds.neLng,
      currentBounds.neLat,
      currentBounds.swLng,
      currentBounds.swLat,
    ])
    let previousPolygon = bboxPolygon([
      previousBounds.neLng,
      previousBounds.neLat,
      previousBounds.swLng,
      previousBounds.swLat,
    ])
    return { currentPolygon, previousPolygon }
  }

  componentDidMount() {
    const {
      styleURI,
      accessToken,
      latitude,
      longitude,
      zoom,
      onClick,
      onLoad,
      onMoveEnd,
    } = this.props

    mapboxgl.accessToken = accessToken
    let map = new mapboxgl.Map({
      container: this.element,
      style: styleURI,
      center: [longitude, latitude],
      zoom: zoom,
      trackResize: true,
    })

    map.component = this
    this.map = map

    if (!isMobile.any) {
      window.geocoder = new MapboxGeocoder({
        placeholder: 'Zoom to your city',
        accessToken: mapboxgl.accessToken,
      })
      document
        .getElementById('geocoder-container')
        .appendChild(geocoder.onAdd(map))
    }

    map.addControl(new Flash())

    if (!isMobile.any) {
      if (this.props.navigation) {
        var nav = new mapboxgl.NavigationControl()
        map.addControl(nav, this.props.navigation)
      }
    }

    map.on('click', this.handleClick)

    let handleMapMove = e => {
      let bounds = e.target.getBounds()
      let boundsObj = {
        neLat: bounds.getNorthEast().lat,
        neLng: bounds.getNorthEast().lng,
        swLat: bounds.getSouthWest().lat,
        swLng: bounds.getSouthWest().lng,
        center: e.target.getCenter(),
        zoom: e.target.getZoom(),
      }
      // Bounds changed, if there is a handler, call it.
      if (this.props.onBoundsChange) {
        this.props.onBoundsChange(boundsObj)
      }

      // A trickier question: Do we need data?
      // This translates to: does the data we have loaded cover the map
      // bounds?
      let boundsArray = [
        boundsObj.neLng,
        boundsObj.neLat,
        boundsObj.swLng,
        boundsObj.swLat,
      ]
      let mapCorners = explode(bboxPolygon(boundsArray))
      if (this.hasData()) {
        // Create an polygon around the data
        let dataExtent = featureCollection([
          bboxPolygon(extent(this.props.data)),
        ])
        // Are the mapCorners inside the area covered by the dataExtent?
        let { features } = within(mapCorners, dataExtent)
        // No corners within the area covered by data? Do we have a function to call?
        if (
          features.length === 0 &&
          typeof this.props.onDataNeeded === 'function'
        ) {
          this.props.onDataNeeded(boundsObj)
        }
      } else {
        // No data? Need some.
        if (this.props.onDataNeeded) {
          this.props.onDataNeeded(boundsObj)
        }
      }
    }

    //Use touchend on mobile
    //otherwise you get WAY to many events
    if (isMobile.any) {
      map.on('touchend', handleMapMove)
    } else {
      map.on('moveend', handleMapMove)
    }
    map.on('zoomend', handleMapMove)

    map.on('load', handleMapMove)
  }

  hasData() {
    if (this.props.data.features && this.props.data.features.length > 0) {
      return true
    } else {
      return false
    }
  }

  getBounds() {
    let bounds = this.map.getBounds()
    let boundsObj = {
      neLat: bounds.getNorthEast().lat,
      neLng: bounds.getNorthEast().lng,
      swLat: bounds.getSouthWest().lat,
      swLng: bounds.getSouthWest().lng,
      center: this.map.getCenter(),
      zoom: this.map.getZoom(),
    }
    return boundsObj
  }

  addDataLayerToMap(data) {
    if (data.features !== []) {
      if (this.map.getLayer('markers')) {
        this.map.removeLayer('markers')
      }
      if (this.map.getLayer('selected')) {
        this.map.removeLayer('selected')
      }
      if (this.map.getSource('markers')) {
        this.map.removeSource('markers')
      }

      this.map.addSource('markers', {
        type: 'geojson',
        data: data,
      })

      this.map.addLayer({
        id: 'markers',
        type: 'symbol',
        interactive: true,
        source: 'markers',
        layout: {
          'icon-image': this.props.marker || 'marker-24',
          'text-field': '{title}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 0.6],
          'text-anchor': 'top',
        },
      })

      this.map.addLayer({
        id: 'selected',
        type: 'symbol',
        interactive: true,
        source: 'markers',
        filter: ['==', this.props.highlight, true],
        layout: {
          'icon-image': this.props.selected || 'marker-stroked-24',
          'text-field': '{title}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 0.6],
          'text-anchor': 'top',
        },
      })
    }
  }

  setCenter(lat, lng, zoom) {
    this.map.jumpTo({ center: new mapboxgl.LngLat(lng, lat), zoom: zoom })
  }

  shouldComponentUpdate(nextProps, nextState) {
    let center = this.map.getCenter()
    let currentZoom = this.map.getZoom()
    let nextZoom = parseFloat(nextProps.zoom)
    let lat = parseFloat(nextProps.latitude)
    let lng = parseFloat(nextProps.longitude)
    let currentHighlight = this.props.highlight
    //If the URL was set by this.props.router.push above
    //nextProps and the current map state would be the same
    if (
      !(lat === center.lat && lng === center.lng && nextZoom == currentZoom)
    ) {
      //Out of sync, so the URL is being set by the user pushing
      //back/forward buttons
      this.map.jumpTo({ center: new mapboxgl.LngLat(lng, lat), zoom: nextZoom })
    }

    if (
      differenceby(
        nextProps.data.features,
        this.props.data.features,
        x => x.properties.address,
      ).length !== 0
    ) {
      this.addDataLayerToMap(nextProps.data)
    }

    if (nextProps.highlight !== currentHighlight) {
      this.map.setFilter('selected', ['==', nextProps.highlight, true])
    }

    return false
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.remove()
    }
  }

  handleClick(e) {
    let map = e.target

    let features = map.queryRenderedFeatures(e.point, {
      layer: ['markers', 'selected'],
    })

    // Features is an array of things found near the click.
    // Since it can return map features as well as data from layers we
    // need to check if the source is mapbox.
    if (features.length > 0 && features[0].layer.source !== 'mapbox') {
      // send location id to owner
      this.component.props.onClick(features[0].properties.id)
    }
  }

  render() {
    return <div ref={el => (this.element = el)} style={this.props.style} />
  }
}

export default Map
