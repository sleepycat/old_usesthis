import MediaQuery from 'react-responsive'
import summary from './summary'
import Map from './components/Map'
import React, { PropTypes } from 'react'
import SummaryChart from './components/SummaryChart'
import OrganizationProfileList from './components/OrganizationProfileList'
import OrganizationProfile from './components/OrganizationProfile'
import ReactDOM from 'react-dom'
import {
  Link,
  Router,
  IndexRoute,
  IndexRedirect,
  Route,
  withRouter,
  hashHistory,
} from 'react-router'


class MapView extends React.Component {

  state = { mapData: [], orgProfiles: []}


  updateMapData(data) {
    return this.setState({mapData: data})
  }

  updateOrgProfile(orgs) {
    console.log('updateOrgProfile called')
    return this.setState({orgProfiles: orgs})
  }

  listTechnologies(summaryData) {
    return summaryData.summary.reduce((prev, curr) => { return prev.concat(curr.name) }, [])
  }

  summaryLabelClickHandler(nameOnLabel) {
    this.props.router.push({pathname: this.props.location.pathname, query: {highlight: nameOnLabel}})
  }

  render() {

    let summaryData = summary(this.state.mapData)
    let highlight = this.props.location.query.highlight || ""

    return (
      <div>
	<div id="pullout_panel">
	  <div id="pullout_handle"></div>
	  <div id='detail'>
            <OrganizationProfileList profiles={ this.state.orgProfiles } />
	  </div>
	</div>
	<MediaQuery query='(min-width: 60em)'>
	  <section id="sidebar">
	    <div id='title'>
	      Usesth.is
	    </div>
	    <div id="geocoder-container"></div>
            <SummaryChart labelOnClick={ ::this.summaryLabelClickHandler } width={ 300 } highlight={ highlight }  data={ summaryData } />
	  </section>
	</MediaQuery>
	<MediaQuery query='(max-width: 60em)'>
	  <section id="sidebar">
	    <div id='title'>
	      Usesth.is
	    </div>
	    <div style={{fontSize: '0.8em', width: '33%'}} id="geocoder-container"></div>
	    <SummaryChart labelOnClick={ ::this.summaryLabelClickHandler } highlight={ highlight } width={ 200 } data={ summaryData } />
	  </section>
	</MediaQuery>
	<Map
          router={this.props.router}
	  accessToken='pk.eyJ1IjoibWlrZXdpbGxpYW1zb24iLCJhIjoibzRCYUlGSSJ9.QGvlt6Opm5futGhE5i-1kw'
	  styleURI='mapbox://styles/mikewilliamson/cil16fkvv008oavm1zj3f4zyu'
          highlight={ highlight }
	  center= {[this.props.params.lng, this.props.params.lat]}
	  zoom={this.props.params.zoom}
	  passDataToParent={ ::this.updateMapData } //JSX shorthand for .bind(this)
	  showOrganizationProfile={ ::this.updateOrgProfile }
	/>
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
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
