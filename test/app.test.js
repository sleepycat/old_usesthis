import request from 'supertest'
import { Database } from 'arangojs'
import App from '../src/app'

const dbConfig = require('../arangodb_config')['test']
const db = new Database(dbConfig)

let app

describe('App', () => {

  describe('GET /', () => {

    beforeAll(async () => {
      app = await App(db)
    })

    it('serves the root route', (done) => {
      request(app)
      .get('/')
      .expect(/Usesth.is/)
      .end(done);
    })

  });


});
