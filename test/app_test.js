let request = require('supertest')
  , app = require('../src/app');

describe('App', () => {

  describe('GET /', () => {

    it('serves the root route', (done) => {
      request(app)
      .get('/')
      .expect(/Usesth.is/)
      .end(done);
    })

  });


});
