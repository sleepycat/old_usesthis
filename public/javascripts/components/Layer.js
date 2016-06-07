import React, { PropTypes } from 'react'
import Convert from '../convert'

export default class Layer extends React.Component {

  static contextTypes = {
    map: PropTypes.object
  }

  constructor(props){
    super(props)
  }

  render() {
    if(typeof this.context.map != 'undefined'){
      let map = this.context.map

      if(!(this.props.data === [])){
        try {
          map.removeLayer("markers")
          map.removeSource("markers")
        }
        catch (e){
          // move along. Nothing to see here.
        }

        map.addSource("markers", {
          "type": "geojson",
          "data": Convert.toGeojson(this.props.data)
        });

        map.addLayer({
          "id": "markers",
          "type": "symbol",
          "interactive": true,
          "source": "markers",
          "layout": {
            "icon-image": "{marker-symbol}-24",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
          }
        });
      }
    }
    return false
  }

}

