process.env.NODE_ENV = 'test'

import { stringify } from 'querystring';
var express = require('express');
var request = require('supertest')
    , app = require('../app');

function urlString(urlParams?: ?Object) {
  var string = '/graphql';
  if (urlParams) {
    string += ('?' + stringify(urlParams));
  }
  return string;
}


describe('GET /graphql', () => {

  it('can hit the graphql endpoint', done => {
    request(app)
      .get(urlString({ query: '{test}' }))
      .expect(200)
      .end(done);
  })

  it('it responds to nonsense with a 400', done => {
    request(app)
      .get(urlString({ query: '{asdf}' }))
      .expect(400)
      .end(done);
  })

})

