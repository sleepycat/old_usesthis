//TODO: importing all of underscore is heavy.
// Look into a lighter-weight alternative. Lodash?
import _ from 'underscore'

let summary = (locations) => {
  let technologies = []
  let organizations = 0
  locations.map((location) => {
    if(typeof location.organizations == 'string'){
      JSON.parse(location.organizations).map((org) => {
        organizations += 1
        technologies = technologies.concat(org.technologies)
      })
    } else {
      location.organizations.map((org) => {
        organizations += 1
        technologies = technologies.concat(org.technologies)
      })
    }
  })

  let sums =  _.chain(technologies)
  .countBy('name')
  .map((value, key) => { return { name: key, count: value} })
  .sortBy((obj) => { return obj.count })
  .reverse()
  .value()

  return {summary: sums, sample_size: organizations }
};

export default summary;
