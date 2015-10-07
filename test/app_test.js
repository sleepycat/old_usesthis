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
           let locations = res.body.data.locations;
           if(!(locations.length == 2)) throw new Error("Response did not include 2 locations.");
         })
         .end(done);
       })
     });

  });
});
