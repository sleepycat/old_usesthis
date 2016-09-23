import MediaQuery from 'react-responsive'
import Convert from './convert'
import summary from './summary'
import Map from './components/Map'
import React, { PropTypes } from 'react'
import SummaryChart from './components/SummaryChart'
import ReactDOM from 'react-dom'
import Drawer from './components/Drawer'
import bboxPolygon from 'turf-bbox-polygon'
import point from 'turf-point'
import polygon from 'turf-polygon'
import inside from 'turf-inside'
import within from 'turf-within'
import featureCollection from 'turf-featurecollection'
import {
  Link,
  Router,
  IndexRoute,
  IndexRedirect,
  Route,
  withRouter,
  hashHistory,
} from 'react-router'
import Lokka from 'lokka'
import Transport from 'lokka-transport-http'

const client = new Lokka({ transport: new Transport('/graphql') })

class MapView extends React.Component {

  state = { mapData: {"type": "FeatureCollection", "features": []}, orgProfiles: []}

  updateOrgProfile(locationID) {

      client.query(`
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
      `, {id: locationID}).then(result => {

         this.setState({orgProfiles: result.location.organizations})

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
	      technologies:languages {
		name
	      }
	    }
	  }
	}
      `, bounds).then((result) => {
      this.setState({mapData: Convert.toGeojson(result.locations_within_bounds), bounds})
    }, (e) => {
      this.flashMessageOnMap(e.message.split(':')[1])
    })
  }

  handleMapBoundsChange(currentBounds) {

      //TODO: consider if this logic should be moved into the <Map />
      //XXX: loop back and clean this up
      //
      // Do we need to fetch new data?
      if(!(typeof this.state.bounds == 'undefined')){
        let previousPolygon = bboxPolygon([this.previousBounds.neLng, this.previousBounds.neLat, this.previousBounds.swLng, this.previousBounds.swLat])
        window.prev = previousPolygon
        let currentNE = point([currentBounds.neLng, currentBounds.neLat])
        let currentSW = point([currentBounds.swLng, currentBounds.swLat])
        // If the current bounds are within the previous polygon
        // we don't need new data.
        if(!(inside(currentNE, previousPolygon) && inside(currentSW, previousPolygon))){
          this.getDataForBounds(currentBounds)
          this.previousBounds = currentBounds
        } else {
          //We don't need data but need to set bounds so the summary can
          //use them to update.
          this.setState({bounds: currentBounds})
        }
      } else {
        //First load
        this.getDataForBounds(currentBounds)
        this.previousBounds = currentBounds
      }

    this.updateRoute(currentBounds.zoom, currentBounds.center.lat, currentBounds.center.lng, this.props.location.query.highlight)
  }

  updateRoute(zoom, lat, lng, highlight = '') {
    let opts = {
      pathname:`/map=${zoom}/${lat}/${lng}`,
      query: {highlight}
    }
    this.props.router.push(opts)
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
            <SummaryChart labelOnClick={ ::this.summaryLabelClickHandler } width={ 300 } highlight={ highlight }  data={ summaryData } />
          </section>
          <Map
            data={ this.state.mapData }
            router={this.props.router}
            accessToken='pk.eyJ1IjoibWlrZXdpbGxpYW1zb24iLCJhIjoibzRCYUlGSSJ9.QGvlt6Opm5futGhE5i-1kw'
            styleURI='mapbox://styles/mikewilliamson/cil16fkvv008oavm1zj3f4zyu'
            style={{
              zIndex: 0,
              height: '100vh',
              width: '80vw'
            }}
            highlight={ highlight }
            center= {[this.props.params.lng, this.props.params.lat]}
            zoom={this.props.params.zoom}
            onBoundsChange={ ::this.handleMapBoundsChange }
            showOrganizationProfile={ ::this.updateOrgProfile }
          />
        </MediaQuery>
        <MediaQuery query='(max-width: 60em)'>
          <section id="sidebar">
            <div id='title'>
              Usesth.is
            </div>
            <div style={{fontSize: '0.8em', width: '33%'}} id="geocoder-container"></div>
            <SummaryChart labelOnClick={ ::this.summaryLabelClickHandler } highlight={ highlight } width={ 200 } data={ summaryData } />
          </section>
          <Map
            data={ this.state.mapData }
            router={this.props.router}
            accessToken='pk.eyJ1IjoibWlrZXdpbGxpYW1zb24iLCJhIjoibzRCYUlGSSJ9.QGvlt6Opm5futGhE5i-1kw'
            styleURI='mapbox://styles/mikewilliamson/cil16fkvv008oavm1zj3f4zyu'
            style={{
              zIndex: 0,
              height: '100vh',
              width: '100%'
            }}
            highlight={ highlight }
            center= {[this.props.params.lng, this.props.params.lat]}
            zoom={this.props.params.zoom}
            onBoundsChange={ ::this.handleMapBoundsChange }
            showOrganizationProfile={ ::this.updateOrgProfile }
          />
        </MediaQuery>
      </div>
    );
  }
}

class App extends React.Component {


  render() {
    return (
      <main>
        {this.props.children}
      </main>
    );
  }
}

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={App} >
      <IndexRedirect to="map=10/37.66552780572411/-122.27593323274039" />
      <Route path="map=:zoom/:lat/:lng" component={ withRouter(MapView) } />
    </Route>
  </Router>
  , document.getElementById('app'))
