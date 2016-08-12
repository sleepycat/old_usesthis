require("babel-polyfill");

import expect from 'expect'
import {
  graphql,
  GraphQLSchema,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

import UrlType from '../../src/data/types/urlType'

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      url: {
	type: UrlType,
	args: {},
	resolve: () => {
	  return "https://www.example.com"
	},
      }
    })
  }),
  mutation: new GraphQLObjectType({
    name: 'mutation',
    fields: () => ({
      add_url: {
	type: UrlType,
	args: {
	  url: { type: new GraphQLInputObjectType({
            name: 'URLinput',
            fields: { url: { type: new GraphQLNonNull(UrlType) } }
          })}
        },
	resolve: (source, args) => {
	  return "http://www.example.com"
	},
      }
    })
  })
});

describe('The UrlType', () => {

  it('correctly returns something using the url type', async () => {

    let query = `
      query fooQuery {
	url
      }
    `;

    let result = await graphql(schema, query);
    expect(result.data.url).toEqual('https://www.example.com');
  })

  it('can be used as an type with input objects', async () => {

    let query = `
      mutation foo {
        add_url(
	  url: {url: "http://www.example.com"}
	)
      }
    `;

    let result = await graphql(schema, query);
    expect(result.data.add_url).toEqual('http://www.example.com');
  })

  it('will throw and error if you try to add something that is not a url', async () => {

    let query = `
      mutation foo {
        add_url(
	  url: {url: "foo"}
	)
      }
    `;

    let result = await graphql(schema, query);
    expect(result.errors).toExist();
    expect(result.errors[0].message).toInclude("Not a valid URL");
  })

})

