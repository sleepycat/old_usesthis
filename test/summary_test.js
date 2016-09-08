require("babel-polyfill");
import expect from 'expect'
import summary from '../public/javascripts/summary'
import Convert from '../public/javascripts/convert'
import testData from './data/locations_within_bounds.json'

describe('summary', () => {

  it('creates a summary', async () => {
    let locations = testData.data.locations_within_bounds
    let sums = summary(Convert.toGeojson(locations))
    expect(sums.summary).toInclude({name: "javascript", count: 39})
    expect(sums.sample_size).toEqual(54)
  })

})
