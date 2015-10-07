var request = require('supertest')
  , dbConfig = require('../arangodb_config')[process.env.NODE_ENV]
  , db = require('arangojs')(dbConfig)
  , app = require('../app');

describe('App', () => {

  describe('GET /', function(){

    it('serves the root route', function(done){
      request(app)
      .get('/')
      .expect(/Welcome to Express/)
      .end(done);
    })

  });


  describe('POST /graphql', function(){

    it('serves a specified location', done => {
      let vertex = {type: 'location', address: '1234 Main St', lat: 45.5, lng: -75.0}
      db.truncate()
      .then(() => { return db.collection('vertices') })
      .then( vertices => { return vertices.save(vertex) })
      .then( doc => {
        request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send('{"query": "{ location(id:' + doc._key +'){address} }"}')
        .expect('{\n  "data": {\n    "location": {\n      "address": "1234 Main St"\n    }\n  }\n}')
        .end(done);
      })
    })


     it('it has an id instead of the Arangodb _key', done => {
       let vertex = {type: 'location', address: '1234 Main St', lat: 45.5, lng: -75.0}
       db.truncate()
       .then(() => { return db.collection('vertices') })
       .then( vertices =>{ return vertices.save(vertex) })
       .then( doc => {
         request(app)
         .post('/graphql')
         .set('Content-Type', 'application/json; charset=utf-8')
         .send('{"query": "{ location(id:' + doc._key +'){id lat lng address} }"}')
         .expect('{\n  "data": {\n    "location": {\n      "id": ' + doc._key + ',\n      "lat": 45.5,\n      "lng": -75,\n      "address": "1234 Main St"\n    }\n  }\n}'
         )
         .end(done);
       })
     });

    it('it shows details of the type', done => {
        request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send({"query": "{ __type(name: \"Location\"){ name } }"})
        .expect('{\n  "data": {\n    "__type": {\n      "name": "Location"\n    }\n  }\n}')
        .end(done);
      })

     it('it can return a collection of locations', done => {
       db.truncate()
       .then(() => { return db.collection('vertices') })
       .then( vertices => {
         return vertices.import([
           { type: 'location', address: '1234 Main St', lat: 45.5, lng: -75.0 },
           { type: 'location', address: '1 Sesame St', lat: 43.5, lng: -75.5 }
         ]);
       })
       .then(() => {
         request(app)
         .post('/graphql')
         .set('Content-Type', 'application/json; charset=utf-8')
         .send('{"query": "{ locations{address} }"}')
         .expect((res) => {
           if(typeof res.body.errors !== 'undefined') throw new Error(res.body.errors[0].message);
           let locations = res.body.data.locations;
           if(!(locations.length == 2)) throw new Error("Response did not include 2 locations.");
         })
         .end(done);
       })
     });

     // Nota Bene: This test will fail if there no geo indexes created!
     it('returns a locations within given bounds', done => {
       db.truncate()
       .then(() => { return db.collection('vertices') })
       .then( vertices => {
         return vertices.import([
           {"lat":45.4292652,"lng":-75.6900505,"type":"location","address":"126 York Street, Ottawa, ON K1N, Canada"},
           {"lat":-41.287723,"lng":174.776344,"type":"location","address":"56 Victoria Street, Wellington, Wellington 6011, New Zealand"}
         ]);
       })
       .then(() => {
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
       })
     });

  });
});
