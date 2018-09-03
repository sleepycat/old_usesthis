let locationToFeature = location => {
  let loc = Object.assign({}, location)
  loc['marker-symbol'] = 'marker'
  loc.title = location.organizations.reduce((prev, curr) => {
    return prev === '' ? prev + curr.name : prev + ' & ' + curr.name
  }, '')

  let technologies = location.organizations.reduce((prev, curr) => {
    return prev.concat(
      curr.technologies.map(tech => {
        return tech.name
      }),
    )
  }, [])

  // Mapboxgl-js does not support complex data structures like arrays of
  // strings in their filters.
  // https://www.mapbox.com/mapbox-gl-style-spec/#types-filter
  // Since we can only match against simple stuff:
  technologies.forEach(technology => {
    loc[technology] = true
  })

  return {
    type: 'Feature',
    properties: loc,
    geometry: {
      type: 'Point',
      coordinates: [location.lng, location.lat],
    },
  }
}

class Convert {
  constructor() {}

  static toGeojson(locations) {
    return {
      type: 'FeatureCollection',
      features: locations.map(locationToFeature),
    }
  }
}

export default Convert
