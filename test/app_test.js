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

    before(()=>{
    })

    after(()=>{
    })

    it('serves a specified location', done => {
      db.collection('vertices')
      .then((vertices)=>{ return vertices.save({type: 'location', address: '1234 main st', lat: 45.5, lng: -75.0}) })
      .then((doc) => { return doc })
      .then(doc => {
        request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send('{"query": "{ location(id:' + doc._key +'){address} }"}')
        .expect('{\n  "data": {\n    "location": {\n      "address": "1234 main st"\n    }\n  }\n}')
        .end(done);
      })
    })


    it('it has an id instead of the Arangodb _key', done => {
      db.collection('vertices')
      .then((vertices)=>{ return vertices.save({type: 'location', address: '1234 main st', lat: 45.5, lng: -75.0}) })
      .then((doc) => { return doc })
      .then(doc => {
        request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send('{"query": "{ location(id:' + doc._key +'){id lat lng address} }"}')
        .expect('{\n  "data": {\n    "location": {\n      "id": ' + doc._key + ',\n      "lat": 45.5,\n      "lng": -75,\n      "address": "1234 main st"\n    }\n  }\n}'
)
        .end(done);
      })
    })

  });

})
