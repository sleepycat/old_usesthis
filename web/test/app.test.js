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

  describe('GET /alive', () => {
    it('responds in the affirmative to a simple liveness check', async () => {
      let response = await request(app).get('/alive')

      expect(response.text).toEqual('yes')
    })
  })

  describe('GET /ready', () => {
    it('checks that it has database connectivity to see if we are ready for traffic', async () => {
      let response = await request(app).get('/ready')

      expect(response.text).toEqual('yes')
    })
  })
})
