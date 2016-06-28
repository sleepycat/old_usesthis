require("babel-polyfill");

import expect from 'expect'
import {
  technologiesForOrganization,
  orgsAndTechnologiesForLocation,
  orgsForLocation,
  organizationByName,
  locationByID,
  locationsWithinBounds,
  db
} from '../data/database'

let _126_york = "vertices/2733712293"

describe('database functions', () => {

  beforeEach(async () => {
    let vertex_data = require('./data/vertices').vertices
    let edge_data = require('./data/edges').edges
    await db.truncate()
    let vertices = await db.collection('vertices')
    await vertices.import(vertex_data)
    let edges = db.collection('edges')
    await edges.import(edge_data)
  })

  afterEach(async () => {
    await db.truncate()
  })


  describe('orgsAndTechnologiesForLocation()', () => {

    it('returns the organizations and languages for the location', async (done) => {
      //TODO: this test suggests that this function is poorly named.
      let orgs = await orgsAndTechnologiesForLocation(_126_york, {category: "language"})
      let technologies = orgs.reduce((prev, curr) => { return prev.concat(curr.technologies)}, [])
      let categories = technologies.map((tech) => { return tech.category })
      expect(categories).toNotContain("tools")
      expect(categories).toNotContain("storage")
      expect(categories).toNotContain("os")
      done();
    })

  })
});
