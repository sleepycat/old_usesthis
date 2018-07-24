import request from 'supertest'
import { Database } from 'arangojs'
import App from '../src/app'

const dbConfig = require('../arangodb_config')['test']
const db = new Database(dbConfig)
let app, vertex_data, edge_data

describe('Mutations', () => {
  beforeAll(async () => {
    app = await App(db)
    vertex_data = require('./data/vertices').vertices
    edge_data = require('./data/edges').edges
  })

  beforeEach(async () => {
    let vertices = db.collection('vertices')
    await vertices.import(vertex_data)
    let edges = db.collection('edges')
    await edges.import(edge_data)
  })

  afterEach(async () => {
    await db.truncate()
  })

  it('creates a new organization without duplicating the location', async () => {
    let graphql = `
      mutation {
        location:createOrganization(
          name: "Kivuto Solutions Inc."
          founding_year: 1997
          url: "http://kivuto.com/"
    locations: [{ address: "126 York Street, Ottawa, ON K1N, Canada", lat: 45.4292652, lng: -75.6900505 }],
          technologies: [{name: "asp.net", category:LANGUAGES}, {name: "sql-server", category: STORAGE}]
        ){
          founding_year
        }
      }
    `

    let response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(`{"query": ${JSON.stringify(graphql)}}`)

    let { location } = response.body.data
    expect(location.founding_year).toEqual(1997)
  })

  it('creates an organizations with multiple locations', async () => {
    let graphql = `
      mutation { createOrganization(
        name: "QlikTech International AB"
        founding_year: 1993
        url: "http://www.qlik.com"
        locations: [
          {address: "390 March Rd, Kanata, ON K2K 3H4, Canada", lat: 45.34036709999999, lng: -75.9117723},
          {address: "26 Sóltún, Austurbær Reykjavík, Iceland", lat: 64.144207, lng: -21.893473},
          {address: "Scheelevägen 24, 223 63 Lund, Sweden", lat: 55.7163564, lng: 13.2212684},
          {address: "Via Stella, 11, 36070 Stella VI, Italy", lat: 45.5952034, lng: 11.3200602}
        ]
        technologies: [
          {name: "c++", category: LANGUAGES},
          {name: "java", category: LANGUAGES},
          {name: "docker", category: TOOLS},
          {name: "cassandra", category: STORAGE},
          {name: "angular", category: FRAMEWORKS},
          {name: "javascript", category: LANGUAGES},
          {name: "nodejs", category: TOOLS},
          {name: "qt", category: LIBRARIES},
          {name: "cordova", category: TOOLS}
        ]
      ) {
        name
        founding_year
        url
      }}
    `

    let insertionResponse = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(`{"query": ${JSON.stringify(graphql)}}`)

    let locationsAroundReykjavík = `
        query getLocations($neLat: Float, $neLng: Float, $swLat: Float, $swLng: Float) {
          locations_within_bounds(ne_lat: $neLat, ne_lng: $neLng, sw_lat: $swLat, sw_lng: $swLng){
            id
            lat
            lng
            address
            organizations {
              name
              technologies {
                name
              }
            }
          }
        }
      `

    let variables = {
      neLat: 64.19786068472125,
      neLng: -21.709671020507812,
      swLat: 64.08390599654476,
      swLng: -22.164573669433594,
    }

    let response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(
        JSON.stringify({
          query: locationsAroundReykjavík,
          variables: variables,
        }),
      )

    let { data } = response.body
    let [locations] = data.locations_within_bounds

    expect(locations.organizations).toHaveLength(1)
  })

  it('rejects malformed urls', async () => {
    let graphql = `
      mutation {
        location:createOrganization(
          name: "Kivuto Solutions Inc."
          founding_year: 1997
          url: "foo"
          locations: [{ address: "126 York Street, Ottawa, ON K1N, Canada", lat: 45.4292652, lng: -75.6900505 }],
          technologies: [{name: "asp.net", category:LANGUAGES}, {name: "sql-server", category: STORAGE}]
        ){
          name
          founding_year
          url
        }
      }
    `

    let response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/graphql; charset=utf-8')
      .send(graphql)

    let [err] = response.body.errors
    expect(err.message).toMatch(/Not a valid URL/)
  })

  it('rejects bad years', async () => {
    let graphql = `
      mutation {
        location:createOrganization(
          name: "Kivuto Solutions Inc."
          founding_year: 2100
    url: "http://www.example.com"
          locations: [{ address: "126 York Street, Ottawa, ON K1N, Canada", lat: 45.4292652, lng: -75.6900505 }],
          technologies: [{name: "asp.net", category:LANGUAGES}, {name: "sql-server", category: STORAGE}]
        ){
          name
          founding_year
          url
        }
      }
    `

    let response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/graphql; charset=utf-8')
      .send(graphql)

    let [err] = response.body.errors
    expect(err.message).toMatch(
      /Year should be somewhere between 1600 and the current year/,
    )
  })

  it('accepts a url for public code repo', async () => {
    let graphql = `
      mutation {
        location:createOrganization(
          name: "Kivuto Solutions Inc."
          founding_year: 1997
          url: "http://kivuto.com/"
          code: "https://github.com/kivuto"
          locations: [{ address: "126 York Street, Ottawa, ON K1N, Canada", lat: 45.4292652, lng: -75.6900505 }],
          technologies: [{name: "asp.net", category:LANGUAGES}, {name: "sql-server", category: STORAGE}]
        ){
          code
        }
      }
    `

    let response = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(`{"query": ${JSON.stringify(graphql)}}`)

    let { location } = response.body.data
    expect(location.code).toEqual('https://github.com/kivuto')
  })
})
