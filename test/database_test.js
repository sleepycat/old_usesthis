require("babel-polyfill");

import expect from 'expect'
import {
  technologiesForOrganization,
  languagesForOrganization,
  orgsAndTechnologiesForLocation,
  orgsAndLanguagesForLocation,
  orgsForLocation,
  organizationByName,
  locationByID,
  locationsWithinBounds,
  db
} from '../src/data/database'

let _126_york = "vertices/2733712293"
let shopify = "vertices/2731811749"

describe('database functions', () => {

  beforeEach(async () => {
    let vertex_data = require('./data/vertices').vertices
    let edge_data = require('./data/edges').edges
    let vertices = db.collection('vertices')
    await vertices.import(vertex_data)
    let edges = db.collection('edges')
    await edges.import(edge_data)
  })

  afterEach(async () => {
    await db.truncate()
  })

  describe('orgsAndLanguagesForLocation()', () => {

    it('returns the organizations and languages for the location', async (done) => {
      let orgs = await orgsAndLanguagesForLocation(_126_york)
      let technologies = orgs.reduce((prev, curr) => { return prev.concat(curr.technologies)}, [])
      let categories = technologies.map((tech) => { return tech.category })
      expect(categories).toContain("language")
      expect(categories).toNotContain("tool")
      expect(categories).toNotContain("storage")
      expect(categories).toNotContain("os")
      done();
    })

  })

  describe('orgsAndTechnologiesForLocation()', () => {

    it('returns the organizations and technologies for the location', async (done) => {
      let orgs = await orgsAndTechnologiesForLocation(_126_york)
      let technologies = orgs.reduce((prev, curr) => { return prev.concat(curr.technologies)}, [])
      let categories = technologies.map((tech) => { return tech.category })
      expect(categories).toContain("tool")
      expect(categories).toContain("language")
      expect(categories).toContain("storage")
      expect(categories).toContain("os")
      done();
    })

  })

  describe('languagesForOrganization()', () => {

    it('returns the languages in use for the specified organization', async (done) => {
      let technologies = await languagesForOrganization(shopify)
      let categories = technologies.map((tech) => { return tech.category })
      expect(categories).toContain("language")
      expect(categories).toNotContain("tool")
      expect(categories).toNotContain("storage")
      expect(categories).toNotContain("os")
      done();
    })

  })
});
