import MediaQuery from 'react-responsive'
import summary from './summary'
import Map from './components/Map'
import React, { PropTypes } from 'react'
import SummaryChart from './components/SummaryChart'
import OrganizationProfile from './components/OrganizationProfile'
import ReactDOM from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'


class App extends React.Component {

  state = { mapData: [], orgProfiles: []}


  updateMapData(data) {
    return this.setState({mapData: data})
  }

  updateOrgProfile(orgs) {
    return this.setState({orgProfiles: orgs})
  }

  organizationProfile() {
    if(this.state.orgProfiles.length == 0){
      return(
	<p key={ btoa("default") }  className="explanation">
	  Click one of the organizations on the map to see the details.
	</p>
      )
    } else {
      return this.state.orgProfiles.map((org) => <OrganizationProfile key={ btoa(org.name) } { ...org } />)
    }
  }

  render() {
    return (
      <div>
	<div id="pullout_panel">
	  <div id="pullout_handle"></div>
	  <div id='detail'>
	    { this.organizationProfile() }
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
	  passDataToParent={ ::this.updateMapData } //JSX shorthand for .bind(this)
	  showOrganizationProfile={ ::this.updateOrgProfile }
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
