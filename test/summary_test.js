require("babel-polyfill");
import expect from 'expect'
import summary from '../public/javascripts/summary'
import testData from './data/locations_within_bounds.json'

describe('summary', () => {

  it('does stuff', async () => {
    let locations = testData.data.locations_within_bounds
    let sums = summary(locations)
    expect(sums).toInclude({name: "javascript", count: 39})
  })

})
