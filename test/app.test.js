import request from 'supertest'
import App from '../src/app'
import { db } from '../src/db'

let app

describe('App', () => {
  beforeAll(async () => {
    app = await App(db)
  })
  describe('GET /', () => {
    it('serves the root route', async () => {
      let response = await request(app).get('/')

      expect(response.text).toMatch(/Usesth.is/)
    })
  })
})
