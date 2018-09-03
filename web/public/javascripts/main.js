import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import MapView from './components/MapView'
import { StyleRoot } from 'radium'
import {
  Link,
  Router,
  IndexRoute,
  IndexRedirect,
  Route,
  withRouter,
  hashHistory,
} from 'react-router'

class App extends React.Component {
  render() {
    return <main>{this.props.children}</main>
  }
}

ReactDOM.render(
  <StyleRoot>
    <Router history={hashHistory}>
      <Route path="/" component={App}>
        <IndexRedirect to="map=10/37.66552780572411/-122.27593323274039" />
        <Route path="map=:zoom/:lat/:lng" component={withRouter(MapView)} />
      </Route>
    </Router>
  </StyleRoot>,
  document.getElementById('app'),
)
