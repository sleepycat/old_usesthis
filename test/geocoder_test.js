require("babel-polyfill");
import expect from 'expect'
//NOTE: These modules are installed via npm for testing and jspm for
//actual useage. Ugly.
import URITemplate from 'urijs/src/URITemplate'
import fetch from 'isomorphic-fetch'
import Geocoder from '../public/javascripts/geocoder'

describe('Geocoder', () => {

  it('has a geocode method', () => {
    expect(Geocoder.geocode).toExist()
  })

  describe('.geocode', () => {
    //XXX: the tests here are hitting the network.
    //Explored fetch-mock to fix this but not worth the pain ATM.

   it('returns a promise', () => {
     expect(Geocoder.geocode("Ottawa")).toBeA(Promise)
   })

   it('formats the result as an object', async (done) => {
     let result = await Geocoder.geocode("Ottawa")
     expect(result.lat).toBeGreaterThan(45)
     done()
   })

  })

})
