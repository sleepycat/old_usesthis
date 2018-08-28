const { hello } = require('../src/resolvers.js').default

describe('resolvers', () => {
  describe('.hello', () => {
    it('returns hello world', async () => {
      expect(hello({},{},{},{})).toEqual('world')
    })
  })
})

