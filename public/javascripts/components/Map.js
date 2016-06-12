import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import isMobile from 'ismobilejs'
import mapboxgl from 'mapbox-gl'
import Geocoder from 'mapbox-gl-geocoder'
import Layer from '../components/Layer'
import FlashMessage from '../components/FlashMessage'
import Navigation from '../components/Navigation'


class Map extends React.Component {

  constructor(props){
    super(props)
  }

  state = {}

  static childContextTypes = {
    map: PropTypes.object
  }

  getChildContext() {
    return {
      map: this.state.map
    }
  }

  static propTypes = {
    accessToken: PropTypes.string.isRequired,
    data: PropTypes.array
  }

  static contextTypes = {
    updateMapData: PropTypes.func.isRequired
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

    map.addControl(new Geocoder({
      container: 'geocoder-container',
      placeholder: 'Zoom to your city'
    }));

    if(typeof onClick == 'function'){
      map.on("click", onClick);
    }

    //Use touchend on mobile
    //otherwise you get WAY to many events
    if(isMobile.any){
      if(typeof onMoveEnd == 'function'){
        map.on("touchend", onMoveEnd);
      }
    } else {
      if(typeof onMoveEnd == 'function'){
         map.on("moveend", onMoveEnd);
      }
    }

    if(typeof onLoad == 'function'){
      map.on("load", onLoad);
    }

    map.on('style.load', (e) => {
      this.setState({ map });
    })

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
        <FlashMessage />
        <Navigation />
        <Layer data={this.props.data} />
      </div>
    )
  }
}


export default Map;
