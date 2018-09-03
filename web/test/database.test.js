import { aql } from 'arangojs'
import dbinit from '../src/data/database'

const { db } = require('../src/db')
let fn, vertex_data, edge_data, _126_york, shopify

async function findVertex(attribute, value) {
  let response = await db.query(aql`
      FOR vertex IN vertices
        FILTER vertex.${attribute} == ${value}
	  LIMIT 1
	  RETURN vertex
    `)
  return response.next()
}

describe('database functions', () => {
  beforeAll(async () => {
    fn = await dbinit(db)
    vertex_data = require('./data/vertices').vertices
    edge_data = require('./data/edges').edges
  })

  beforeEach(async () => {
    let vertices = db.collection('vertices')
    await vertices.import(vertex_data)
    let edges = db.collection('edges')
    await edges.import(edge_data)

    shopify = await findVertex('name', 'Shopify')
    _126_york = await findVertex(
      'address',
      '126 York Street, Ottawa, ON K1N, Canada',
    )
  })

  afterEach(async () => {
    await db.truncate()
  })

  describe('orgsAndLanguagesForLocation()', () => {
    it('returns the organizations and languages for the location', async () => {
      let orgs = await fn.orgsAndLanguagesForLocation(_126_york)
      let technologies = orgs.reduce((prev, curr) => {
        return prev.concat(curr.technologies)
      }, [])
      let categories = technologies.map(tech => {
        return tech.category
      })
      expect(categories).toContain('language')
      expect(categories).not.toContain('tool')
      expect(categories).not.toContain('storage')
      expect(categories).not.toContain('os')
    })
  })

  describe('orgsAndTechnologiesForLocation()', () => {
    it('returns the organizations and technologies for the location', async () => {
      let orgs = await fn.orgsAndTechnologiesForLocation(_126_york)
      let technologies = orgs.reduce((prev, curr) => {
        return prev.concat(curr.technologies)
      }, [])
      let categories = technologies.map(tech => {
        return tech.category
      })
      expect(categories).toContain('tool')
      expect(categories).toContain('language')
      expect(categories).toContain('storage')
      expect(categories).toContain('os')
    })
  })

  describe('languagesForOrganization()', () => {
    it('returns the languages in use for the specified organization', async () => {
      let technologies = await fn.languagesForOrganization(shopify)
      let categories = technologies.map(tech => {
        return tech.category
      })
      expect(categories).toContain('language')
      expect(categories).not.toContain('tool')
      expect(categories).not.toContain('storage')
      expect(categories).not.toContain('os')
    })
  })

  describe('orgsForLocation()', () => {
    it('returns the organizations for the specified location', async () => {
      let organizations = await fn.orgsForLocation(_126_york)
      let names = organizations.map(org => {
        return org.name
      })
      expect(names).toContain('Magmic Inc.')
      expect(names).toContain('Shopify')
    })
  })
})
