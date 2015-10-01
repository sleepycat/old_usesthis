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
      db.collection('vertices')
      .then((vertices)=>{ return vertices.save({hello: 'arangodb!'}) })
    })

    after(()=>{
      db.truncate()
    })

    it('serves data from arango via graphql', done => {
      request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send('{"query": "{hello}"}')
      .expect('{\n  "data": {\n    "hello": "arangodb!"\n  }\n}')
      .end(done);
    })

  });

})
