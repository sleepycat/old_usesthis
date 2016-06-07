import { Component, PropTypes } from 'react'
import mapboxgl from 'mapbox-gl'

export default class Navigation extends Component {

  constructor(props){
    super(props)
  }

  static contextTypes = {
    map: PropTypes.object
  }

  render() {
    //TODO: flash message styles should probably
    //be handled as props
    if(typeof this.context.map != 'undefined'){
      // style.load has fired and parent has rerendered
      // This means the map object in context is ready...
      if(typeof this.context.map._hasNavigation == 'undefined'){
        this.context.map.addControl(new mapboxgl.Navigation());
        this.context.map._hasNavigation = true
      }
    }
    return false // Job done. Render nothing.
  }

}

