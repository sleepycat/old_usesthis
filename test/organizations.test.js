import request from 'supertest'
import App from '../src/app'

const { db } = require('../src/db')
let app, vertex_data, edge_data

describe('organization queries', () => {
  beforeAll(async () => {
    app = await App(db)
    vertex_data = require('./data/vertices').vertices
    edge_data = require('./data/edges').edges
  })

  beforeEach(async () => {
    await db.truncate()
    let vertices = db.collection('vertices')
    await vertices.import(vertex_data)
    let edges = db.collection('edges')
    await edges.import(edge_data)
  })

  it('serves an organization by name', async () => {
    let { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/graphql; charset=utf-8').send(`query {
      organization(
        name: "Shopify"
      ){
        founding_year
      }
    }`)

    let organization = body.data.organization
    expect(organization.founding_year).toEqual(2004)
  })

  it('finds technologies for the named organization', async () => {
    let { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/graphql; charset=utf-8').send(`query {
      organization(
        name: "Shopify"
      ){
        technologies{
          name
        }
      }
    }`)

    let shopify = body.data.organization
    expect(shopify.technologies).toContainEqual({ name: 'ruby' })
  })
})
