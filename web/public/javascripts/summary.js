import countBy from 'lodash.countby'
import sortBy from 'lodash.sortby'

let summary = featureCollection => {
  let technologies = []
  let organizations = 0

  featureCollection.features.map(location => {
    if (typeof location.properties.organizations == 'string') {
      JSON.parse(location.properties.organizations).map(org => {
        organizations += 1
        technologies = technologies.concat(org.technologies)
      })
    } else {
      location.properties.organizations.map(org => {
        organizations += 1
        technologies = technologies.concat(org.technologies)
      })
    }
  })

  let counted = countBy(technologies, 'name')
  let sums = []
  for (var key in counted) {
    if (counted.hasOwnProperty(key)) {
      sums.push({ name: key, count: counted[key] })
    }
  }
  let sorted = sortBy(sums, el => el.count)

  return { summary: sorted.reverse(), sample_size: organizations }
}

export default summary
