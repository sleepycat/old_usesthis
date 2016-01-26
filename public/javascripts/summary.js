import _ from 'underscore'

let summary = (locations) => {
  let technologies = []
  locations.map((location) => {
    location.organizations.map((org) => {
      technologies = technologies.concat(org.technologies)
    })
  })

  let sums =  _.chain(technologies)
  .countBy('name')
  .map((value, key) => { return { name: key, count: value} })
  .sortBy((obj) => { return obj.count })
  .reverse()
  .value()
  return sums
};

export default summary;
