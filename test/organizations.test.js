import { db } from '../src/data/database'
import request from 'supertest'

import app from '../src/app'

describe('organization queries', () => {

    beforeEach(async () => {
      await db.truncate()
      let vertex_data = require('./data/vertices').vertices
      let edge_data = require('./data/edges').edges
      let vertices =  db.collection('vertices')
      await vertices.import(vertex_data)
      let edges = db.collection('edges')
      await edges.import(edge_data)
    })

    it('serves an organization by name', async () => {
      let { body } = await request(app)
	.post('/graphql')
	.set('Content-Type', 'application/graphql; charset=utf-8')
	.send(`query {
	  organization(
	    name: "Shopify"
	  ){
	    founding_year
	  }
	}`)

      console.log('body:',body)
      let organization = body.data.organization
      expect(organization.founding_year).toEqual(2004)
    })

    it('finds technologies for the named organization', async () => {
      let { body } = await request(app)
	.post('/graphql')
	.set('Content-Type', 'application/graphql; charset=utf-8')
	.send(`query {
	  organization(
	    name: "Shopify"
	  ){
	    technologies{
	      name
	    }
	  }
	}`)

      let shopify = body.data.organization
      expect(shopify.technologies).toContainEqual({name: 'ruby'})
    })

})
