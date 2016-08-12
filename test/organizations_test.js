require("babel-polyfill");
import { db } from '../src/data/database'

let request = require('supertest')
  , app = require('../src/app');

describe('organization queries', () => {

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

    it('serves an organization by name', async (done) => {
      request(app)
      .post('/graphql')
      .set('Content-Type', 'application/graphql; charset=utf-8')
      .send(`query { organization(name: "Shopify"){founding_year} }`)
      .expect(`{\n  "data": {\n    "organization": {\n      "founding_year": 2004\n    }\n  }\n}`)
      .end(done);
    })

    it('finds technologies for the named organization', async (done) => {
      request(app)
      .post('/graphql')
      .set('Content-Type', 'application/graphql; charset=utf-8')
      .send(`query { organization(name: "Shopify"){technologies{name}} }`)
      .expect(`{\n  "data": {\n    "organization": {\n      "technologies": [\n        {\n          "name": "coffeescript"\n        },\n        {\n          "name": "ruby-on-rails"\n        },\n        {\n          "name": "mysql"\n        },\n        {\n          "name": "git"\n        },\n        {\n          "name": "ruby"\n        },\n        {\n          "name": "linux"\n        },\n        {\n          "name": "batman.js"\n        }\n      ]\n    }\n  }\n}`)
      .end(done);
    })

});
