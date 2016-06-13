import Lokka from 'lokka'
import MediaQuery from 'react-responsive'
import Transport from 'lokka-transport-http'
import summary from './summary'
import Convert from './convert'
import Map from './components/Map'
import React, { PropTypes } from 'react'
import SummaryChart from './components/SummaryChart'
import ReactDOM from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'

let dispatchEvent = (eventName, data) => {
  let event = document.createEvent('CustomEvent');
  event.initCustomEvent(eventName, true, false, data);
  document.dispatchEvent(event);
};

const client = new Lokka({ transport: new Transport('/graphql') })

//TODO: make this a React component
let createOrganizationView = function(org){
  var div = document.createElement('div');
  div.className = 'organization-detail';
  var link = document.createElement('a');
  link.href = org.url;
  link.text = org.name;
  link.target = '_blank';
  var nameP = document.createElement('p');
  nameP.appendChild(link);
  var techList = document.createElement('ul');
  org.technologies.forEach(function(element, index, array){
    var li = document.createElement('li');
    li.innerHTML = element.name;
    li.className = 'technology';
    techList.appendChild(li);
  });
  div.appendChild(nameP);
  div.appendChild(techList);
  return div;
};


let mapClickHandler = (e) => {
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
        //TODO: we are only displaying the first result here.
        let detailDiv = document.querySelector('#detail');
        while(detailDiv.firstChild){
          detailDiv.removeChild(detailDiv.firstChild);
        }
        result.location.organizations.forEach((org, i, arr) => {
          detailDiv.appendChild(createOrganizationView(org));
        })
    }, (e) => {
      dispatchEvent('mapbox.setflash', {message: e.message.split(':')[1], info: true, fadeout: 3})
    });
  }

}

class App extends React.Component {

  state = { mapData: [] }

  static childContextTypes = {
    updateMapData: PropTypes.func
  }

  getChildContext() {
    return {
      updateMapData: (data) => {
        return this.setState({mapData: data})
      }
    }
  }

  getLocationsWithinBounds(e) {
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
      `, {neLat, neLng, swLat, swLng}).then(result => {

      this.component.context.updateMapData(result.locations_within_bounds)

    }, (e) => {
      //TODO: move to Map component?
      dispatchEvent('mapbox.setflash', {message: e.message.split(':')[1], info: true, fadeout: 3})
    })
  }

  render() {
    return (
      <div>
        <div id="pullout_panel">
          <div id="pullout_handle"></div>
          <div id='detail'>
            <p class="explanation">
              Click one of the organizations on the map to see the details.
            </p>
          </div>
        </div>
        <MediaQuery query='(min-width: 60em)'>
          <section id="sidebar">
            <div id='title'>
              Usesth.is
            </div>
            <div id="geocoder-container"></div>
            <SummaryChart width={ 300 }  data={summary(this.state.mapData)} />
          </section>
        </MediaQuery>
        <MediaQuery query='(max-width: 60em)'>
          <section id="sidebar">
            <div id='title'>
              Usesth.is
            </div>
            <div style={{fontSize: '0.8em', width: '33%'}} id="geocoder-container"></div>
            <SummaryChart width={ 200 } data={summary(this.state.mapData)} />
          </section>
        </MediaQuery>
        <Map
          accessToken='pk.eyJ1IjoibWlrZXdpbGxpYW1zb24iLCJhIjoibzRCYUlGSSJ9.QGvlt6Opm5futGhE5i-1kw'
          styleURI='mapbox://styles/mikewilliamson/cil16fkvv008oavm1zj3f4zyu'
          center= {[-122.27593323274039, 37.66552780572411]}
          zoom={10.006562529849507}
          onMoveEnd={this.getLocationsWithinBounds}
          onLoad={this.getLocationsWithinBounds}
          onClick={mapClickHandler}
          data={this.state.mapData}
        />
      </div>
    );
  }
}

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={App}/>
  </Router>
, document.getElementById('app'))

let handle = document.querySelector("#pullout_handle")

let pulloutMenu = handle.parentElement

let moveFunction = function(e){
  pulloutMenu.style.transform = `translateX(${e.touches[0].pageX - screen.width}px)`
}

handle.addEventListener("touchstart", function(e){
  handle.addEventListener('touchmove', moveFunction)
})

handle.addEventListener("touchend", function(e){
  handle.removeEventListener('touchmove', moveFunction)
})
