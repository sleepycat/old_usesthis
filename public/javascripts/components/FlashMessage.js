import React, { PropTypes } from 'react'
import Flash from 'mapbox-gl-flash'

export default class FlashMessage extends React.Component {

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
      if(typeof this.context.map._hasFlash == 'undefined'){
        this.context.map.addControl(new Flash());
        this.context.map._hasFlash = true
      }
    }
    return false // Job done. Render nothing.
  }

}

