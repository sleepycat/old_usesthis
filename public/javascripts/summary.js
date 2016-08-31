import countBy from 'lodash.countby'
import sortBy from 'lodash.sortby'

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

  let counted = countBy(technologies, 'name')
  let sums = []
  for(var key in counted) {
    if(counted.hasOwnProperty(key)) {
      sums.push({ name: key, count: counted[key]})
    }
  }
  let sorted = sortBy(sums, (el) => el.count)

  return {summary: sorted.reverse(), sample_size: organizations }
};

export default summary;
