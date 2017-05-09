import request from 'supertest'
import App from '../src/app'

let app

describe('App', () => {

  describe('GET /', () => {

    beforeAll(async () => {
      app = await App()
    })

    it('serves the root route', (done) => {
      request(app)
      .get('/')
      .expect(/Usesth.is/)
      .end(done);
    })

  });


});
