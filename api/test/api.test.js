const request = require('supertest')
const Server = require('../src/server').default

describe('Queries', () => {
  describe('hello', () => {
    it('returns world', async () => {
      let app = Server()

      let response = await request(app)
        .post('/graphql')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send({
          query: `{hello}`,
        })

      let {
        data: { hello },
      } = response.body
      expect(hello).toEqual('world')
    })
  })
})
