import MediaQuery from 'react-responsive'
import Convert from '../convert'
import summary from '../summary'
import Map from './Map'
import React, { Component } from 'react'
import SummaryChart from './SummaryChart'
import MyPosition from './MyPosition'
import Drawer from './Drawer'
import bboxPolygon from '@turf/bbox-polygon'
import within from '@turf/within'
import { featureCollection } from '@turf/helpers'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'

const client = new ApolloClient()



class MapView extends React.Component {

  constructor(props) {
    super(props)
    this.setPosition = ::this.setPosition
    this.handleBoundsChange = ::this.handleBoundsChange
    this.handleDataNeeded = ::this.handleDataNeeded
    this.updateOrgProfile = ::this.updateOrgProfile
    this.summaryLabelClickHandler = ::this.summaryLabelClickHandler
  }

  state = { mapData: {"type": "FeatureCollection", "features": []}, orgProfiles: []}

  updateOrgProfile(locationID) {

    let query = gql`
          query getLocation($id: ID!) {
            location(id: $id){
              organizations {
                url
                name
                code
                technologies {
                  name
                }
              }
            }
          }
      `

    client.query({ query, variables: {id: locationID}}).then(({ data }) => {

         this.setState({orgProfiles: data.location.organizations})

      }, (e) => {

        let opts = {
          message: e.message.split(':')[1],
          info: true,
          fadeout: 3
        }

        this.component.dispatchEvent('mapbox.setflash', opts)

      });
  }

  listTechnologies(summaryData) {
    return summaryData.summary.reduce((prev, curr) => { return prev.concat(curr.name) }, [])
  }

  dispatchEvent(eventName, data) {
    let event = document.createEvent('CustomEvent')
    event.initCustomEvent(eventName, true, false, data)
    document.dispatchEvent(event)
  }


  flashMessageOnMap(message) {
    this.dispatchEvent('mapbox.setflash', {message, info: true, fadeout: 3})
  }

  getDataForBounds(bounds) {
    let query = gql`
      query getLocations($neLat: Float, $neLng: Float, $swLat: Float, $swLng: Float) {
        locations_within_bounds(ne_lat: $neLat, ne_lng: $neLng, sw_lat: $swLat, sw_lng: $swLng){
          id
          lat
          lng
          address
          organizations {
            url
            name
            technologies:languages {
        name
            }
          }
        }
      }
    `

    return client.query({ query, variables: bounds })
  }

  handleDataNeeded(currentBounds) {
    this.getDataForBounds(currentBounds)
      .then(({ data }) => {
        this.setState({mapData: Convert.toGeojson(data.locations_within_bounds), bounds: currentBounds})
      }, (e) => {
        this.flashMessageOnMap(e.message.split(':')[1])
      })
  }

  handleBoundsChange(currentBounds) {
    this.updateRoute(currentBounds.zoom, currentBounds.center.lat, currentBounds.center.lng, this.props.location.query.highlight)
    this.setState({bounds: currentBounds})
  }

  updateRoute(zoom, lat, lng, highlight = '') {
    let opts = {
      pathname:`/map=${zoom}/${lat}/${lng}`,
      query: {highlight}
    }
    this.props.router.push(opts)
  }

  setPosition() {
    //TODO: this is pretty ugly.
    //we've only been operating with
    //bounds. Now we get only a lat/lng point and then it causes a
    //hot mess...
    window.navigator.geolocation.getCurrentPosition((position) => {
      let { latitude, longitude } = position.coords
      this.mapComponent.setCenter(latitude, longitude, this.props.params.zoom)
      let bounds = this.mapComponent.getBounds()

      this.handleMapBoundsChange(bounds)
    })
  }


  summaryLabelClickHandler(nameOnLabel) {
    this.props.router.push({pathname: this.props.location.pathname, query: {highlight: nameOnLabel}})
  }

  dataWithinBounds(data, bounds) {
    let boundsArray = [bounds.neLng, bounds.neLat, bounds.swLng, bounds.swLat]
    let boundsPoly = bboxPolygon(boundsArray)
    let points = within(data, featureCollection([boundsPoly]))
    return points
  }

  render() {

    if(this.state.bounds){
      let points = this.dataWithinBounds(this.state.mapData, this.state.bounds)
      var summaryData = summary(points)
    } else {
      var summaryData = summary(this.state.mapData)
    }

    let highlight = this.props.location.query.highlight || ""

    return (
      <div>
        <Drawer contents={ this.state.orgProfiles } />
        <MediaQuery query='(min-width: 60em)'>
          <section id="sidebar">
            <div id='title'>
              Usesth.is
            </div>
            <div id="geocoder-container"></div>
            <SummaryChart labelOnClick={ this.summaryLabelClickHandler } width={ 300 } highlight={ highlight }  data={ summaryData } />
          </section>
          <Map
            data={ this.state.mapData }
            accessToken={ USESTHIS_MAPBOX_ACCESS_TOKEN }
            styleURI='mapbox://styles/mikewilliamson/cil16fkvv008oavm1zj3f4zyu'
            style={{
              zIndex: 0,
              height: '100vh',
              width: '80vw'
            }}
            highlight={ highlight }
            navigation='top-right'
            marker="marker-stroked-24"
            selected="marker-24"
            latitude={ parseFloat(this.props.params.lat) }
            longitude={ parseFloat(this.props.params.lng) }
            zoom={ parseFloat(this.props.params.zoom) }
            onBoundsChange={ this.handleBoundsChange }
            onDataNeeded={ this.handleDataNeeded }
            onClick={ this.updateOrgProfile }
            ref={(map) => this.mapComponent = map}
          />
        </MediaQuery>
        <MediaQuery query='(max-width: 60em)'>
          <MyPosition locate={ this.setPosition } />
          <section id="sidebar">
            <div id='title'>
              Usesth.is
            </div>
            <div style={{fontSize: '0.8em', width: '33%'}} id="geocoder-container"></div>
            <SummaryChart labelOnClick={ this.summaryLabelClickHandler } highlight={ highlight } width={ 200 } data={ summaryData } />
          </section>
          <Map
            data={ this.state.mapData }
            accessToken={ USESTHIS_MAPBOX_ACCESS_TOKEN }
            styleURI='mapbox://styles/mikewilliamson/cil16fkvv008oavm1zj3f4zyu'
            style={{
              zIndex: 0,
              height: '100vh',
              width: '100%'
            }}
            highlight={ highlight }
            navigation='top-right'
            marker="marker-stroked-24"
            selected="marker-24"
            latitude={ parseFloat(this.props.params.lat) }
            longitude={ parseFloat(this.props.params.lng) }
            zoom={ parseFloat(this.props.params.zoom) }
            onBoundsChange={ this.handleBoundsChange }
            onDataNeeded={ this.handleDataNeeded }
            onClick={ this.updateOrgProfile }
            ref={(map) => this.mapComponent = map}
          />
        </MediaQuery>
      </div>
    );
  }
}

export default MapView
