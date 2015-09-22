var request = require('supertest')
  , app = require('../app');


describe('GET /', function(){
  it('serves the root route', function(done){
    request(app)
      .get('/')
      .expect(/Welcome to Express/)
      .end(done);
  })
})
