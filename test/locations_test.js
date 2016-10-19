import { db } from '../src/data/database'
import request from 'supertest'
import expect from 'expect'
import app from '../src/app'

describe('location queries', () => {

  beforeEach(async () => {
    let vertex_data = require('./data/vertices').vertices
    let edge_data = require('./data/edges').edges
    let vertices = await db.collection('vertices')
    await vertices.import(vertex_data)
    let edges = db.collection('edges')
    await edges.import(edge_data)
  })

  afterEach(async () => {
    await db.truncate()
  })

  it('serves a specified location', async () => {
    let { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send('{"query": "{ location(id: 2733712293){address} }"}')

    let location = body.data.location
    expect(location.address).toEqual("126 York Street, Ottawa, ON K1N, Canada")
  })

  it('returns the 2 organizations for the specified location', async () => {
    let { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({"query": "{ location(id: 2733712293){address organizations {name url}} }"})

    let organizations = body.data.location.organizations;
    expect(organizations.length).toEqual(2)

  })

  it('returns the organizations and technologies for the specified location', async () => {
    let { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({"query": "{ location(id:2733712293){address organizations {name url technologies {name}}} }"})

    let organizations = body.data.location.organizations
    expect(organizations.length).toBeGreaterThan(0)
    expect(organizations[0].technologies.length).toEqual(8)
  })

  it('it has an id instead of the Arangodb _key', async () => {
    let { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send('{"query": "{ location(id: 2733712293){id lat lng address} }"}')

    let location = body.data.location
    expect(location.id).toExist()
  })

  it('it shows details of the type', async () => {
    let { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({"query": "{ __type(name: \"Location\"){ name } }"})

    let type = body.data.__type
    expect(type.name).toEqual("Location")
  })


  // Nota Bene: This test will fail if there no geo indexes created!
  it('returns a locations within given bounds', async () => {
    let vertices = db.collection('vertices')
    await vertices.import([
      {"lat":-41.287723,"lng":174.776344,"type":"location","address":"56 Victoria Street, Wellington, Wellington 6011, New Zealand"}
    ])

    let { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({"query": "{ locations_within_bounds(sw_lat:45.41670820924417, sw_lng: -75.75180530548096, ne_lat:45.436104879546555, ne_lng:-75.66940784454347){address} }"})

    let locations = body.data.locations_within_bounds
    expect(locations.length).toEqual(1)
    expect(locations[0].address).toEqual('126 York Street, Ottawa, ON K1N, Canada')
  })

  it('returns an error if the bounds are to big', async () => {
    // Ask for the whole world
    let { body } = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({"query": "{ locations_within_bounds(sw_lat: -58.303625959817744, sw_lng: -203.8709457158272, ne_lat: 82.34832466131675, ne_lng:243.65914906226857){address} }"})

    expect(body.errors).toExist()
  })

})

