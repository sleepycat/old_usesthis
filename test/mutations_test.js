require("babel-polyfill");
import { db } from '../data/database'

let request = require('supertest')
  , app = require('../app');

describe('Mutations', () => {

  beforeEach(async () => {
    let vertex_data = require('./data/vertices').vertices
    let edge_data = require('./data/edges').edges
    await db.truncate()
    let vertices = db.collection('vertices')
    await vertices.import(vertex_data)
    let edges = db.collection('edges')
    await edges.import(edge_data)
  })

  afterEach(async () => {
    await db.truncate()
  })

  it('creates a new organization without duplicating the location', (done) => {
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

    request(app)
    .post('/graphql')
    .set('Content-Type', 'application/json; charset=utf-8')
    .send(`{"query": ${JSON.stringify(graphql)}}`)
    .expect({data: {location: {founding_year: 1997}}})
    .end(done);
  })

  it('creates an organizations with multiple locations', (done) => {
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

    request(app)
    .post('/graphql')
    .set('Content-Type', 'application/json; charset=utf-8')
    .send(`{"query": ${JSON.stringify(graphql)}}`)
    .end(() => {

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
        "neLat":64.19786068472125,
        "neLng":-21.709671020507812,
        "swLat":64.08390599654476,
        "swLng":-22.164573669433594
      }

      request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(JSON.stringify({query: locationsAroundReykjavík, variables: variables }))
      .expect((res) => {
        let organizations = res.body.data.locations_within_bounds[0].organizations
        if (!(organizations.length === 1)) throw new Error(`Expected one organization to be found. Recieved ${organizations}`)
      })
      .end(done);

    })
  })


  it('rejects malformed urls', (done) => {
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

    request(app)
    .post('/graphql')
    .set('Content-Type', 'application/graphql; charset=utf-8')
    .send(graphql)
    .expect((response) => {
      if (!(response.body.errors)) throw new Error(`Expected invalid URL to raise an error. Got ${JSON.stringify(response.body)}`)
      var error = response.body.errors[0]
      if (!( error.message == "Query error: Not a valid URL")) throw new Error(`Expected invalid URL to raise an error. Got ${JSON.stringify(response.body)}`)
    })
    .end(done);
  })

  it('rejects bad years', (done) => {
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

    request(app)
    .post('/graphql')
    .set('Content-Type', 'application/graphql; charset=utf-8')
    .send(graphql)
    .expect((response) => {
      let error = response.body.errors[0]
      if (!(error)) throw new Error(`Expected invalid year to raise an error. Got ${JSON.stringify(response.body)}`)
      if (!( error.message.includes("between 1600 and the current year"))) throw new Error(`Expected invalid year to raise an error. Got ${JSON.stringify(response.body)}`)
    })
    .end(done);
  })

  it('accepts a url for public code repo', (done) => {
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

    request(app)
    .post('/graphql')
    .set('Content-Type', 'application/json; charset=utf-8')
    .send(`{"query": ${JSON.stringify(graphql)}}`)
    .expect({data: {location: {code: "https://github.com/kivuto"}}})
    .end(done);
  })

})

