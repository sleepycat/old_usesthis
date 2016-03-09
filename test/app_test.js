require("babel-polyfill");

let request = require('supertest')
  , dbConfig = require('../arangodb_config')[process.env.NODE_ENV]
  , db = require('arangojs')(dbConfig)
  , app = require('../app');

describe('App', () => {

  describe('GET /', () => {

    it('serves the root route', (done) => {
      request(app)
      .get('/')
      .expect(/Usesth.is/)
      .end(done);
    })

  });

  describe('Mutations', () => {

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

    it('creates a new organization without duplicating the location', (done) => {
      let graphql = `
	mutation {
	  location:createOrganization(
	    name: "Kivuto Solutions Inc."
	    founding_year: 1997
	    url: "http://kivuto.com/"
      locations: [{ address: "126 York Street, Ottawa, ON K1N, Canada", lat: 45.4292652, lng: -75.6900505 }],
	    technologies: [{name: "asp.net", category:"language"}, {name: "sql-server", category: "storage"}]
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
	    {name: "c++", category: "language"},
	    {name: "java", category: "language"},
	    {name: "docker", category: "tools"},
	    {name: "cassandra", category: "storage"},
	    {name: "angular", category: "framework"},
	    {name: "javascript", category: "language"},
	    {name: "nodejs", category: "tools"},
	    {name: "qt", category: "library"},
	    {name: "cordova", category: "tools"}
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



  })

  describe('POST /graphql', () => {

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

    it('serves a specified location', async (done) => {
      request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send('{"query": "{ location(id: 2733712293){address} }"}')
      .expect('{\n  "data": {\n    "location": {\n      "address": "126 York Street, Ottawa, ON K1N, Canada"\n    }\n  }\n}')
      .end(done);
    })

    it('returns the 2 organizations for the specified location', async (done) => {
      request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({"query": "{ location(id: 2733712293){address organizations {name url}} }"})
      .expect((response) => {
        let organizations = response.body.data.location.organizations;
        if (!(organizations.length == 2)) {
          throw new Error(`Organizations returned were: ${JSON.stringify(organizations)}. Was expecting 2`);
        }
      })
      .end(done);
    })

    it('returns the organizations and technologies for the specified location', async (done) => {
      request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({"query": "{ location(id:2733712293){address organizations {name url technologies {name}}} }"})
      .expect((response) => {
        let technologies = response.body.data.location.organizations[0].technologies;
        if (!(technologies.length > 0)) throw new Error(`What was returned ${JSON.stringify(technologies)}`);
      })
      .end(done);
    })

    it('it has an id instead of the Arangodb _key', async (done) => {
      request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send('{"query": "{ location(id: 2733712293){id lat lng address} }"}')
      .expect((res) => {
        if (!('id' in res.body.data.location)) throw new Error("missing id!");
      })
      .end(done);
    });

    it('it shows details of the type', done => {
      request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({"query": "{ __type(name: \"Location\"){ name } }"})
      .expect('{\n  "data": {\n    "__type": {\n      "name": "Location"\n    }\n  }\n}')
      .end(done);
    })


    // Nota Bene: This test will fail if there no geo indexes created!
    it('returns a locations within given bounds', async (done) => {
      let vertices = db.collection('vertices')
      await vertices.import([
        {"lat":-41.287723,"lng":174.776344,"type":"location","address":"56 Victoria Street, Wellington, Wellington 6011, New Zealand"}
      ]);

      request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({"query": "{ locations_within_bounds(sw_lat:45.41670820924417, sw_lng: -75.75180530548096, ne_lat:45.436104879546555, ne_lng:-75.66940784454347){address} }"})
      .expect((res) => {
        if(typeof res.body.errors !== 'undefined') throw new Error(res.body.errors[0].message);
        let locations = res.body.data.locations_within_bounds;
        if(!(locations.length == 1)) throw new Error("Response included locations outside bounds.");
      })
      .end(done);
    });

    it('returns an error if the bounds are to big', async (done) => {
      // Ask for the whole world
      request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({"query": "{ locations_within_bounds(sw_lat: -58.303625959817744, sw_lng: -203.8709457158272, ne_lat: 82.34832466131675, ne_lng:243.65914906226857){address} }"})
      .expect((res) => {
        if(!(res.body.errors)) throw new Error(`No error was raise and the bounds were huge!`);
      })
      .end(done);
    });

  });
});
