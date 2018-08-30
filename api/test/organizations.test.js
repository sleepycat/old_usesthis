const request = require('supertest')
const Server = require('../src/server').default

const { db } = require('../src/db')
let server, vertexData, edgeData

describe('organization queries', () => {
  beforeAll(async () => {
    server = await Server(db)
    vertexData = require('./data/vertices').vertices
    edgeData = require('./data/edges').edges
  })

  beforeEach(async () => {
    await db.truncate()
    let vertices = db.collection('vertices')
    await vertices.import(vertexData)
    let edges = db.collection('edges')
    await edges.import(edgeData)
  })

  it('serves an organization by name', async () => {
    let response = await request(server)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({
        query: `{
          organization(
            name: "Shopify"
          ){
            founding_year
          }
        }`,
      })

    let { organization } = response.body.data
    expect(organization.founding_year).toEqual(2004)
  })

  it('finds technologies for the named organization', async () => {
    let response = await request(server)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({
        query: `query {
          organization(
            name: "Shopify"
          ){
            technologies{
              name
            }
          }
        }`,
      })

    let { organization } = response.body.data
    expect(organization.technologies).toContainEqual({ name: 'ruby' })
  })
})
