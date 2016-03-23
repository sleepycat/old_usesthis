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

import UrlType from '../data/custom_types/urlType'
import YearType from '../data/custom_types/yearType'

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      year: {
        type: YearType,
	resolve: () => 1993
      },
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
      add_year: {
	type: YearType,
	args: {
	  year: { type: new GraphQLInputObjectType({
            name: 'YearInput',
            fields: { year: { type: new GraphQLNonNull(YearType) } }
          })}
        },
	resolve: (source, args) => {
	  return args.year
	},
      },
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


describe('The YearType', () => {

  it('can be used in a shema', async () => {

    let query = `
      query fooQuery {
        year
      }
    `;

    let result = await graphql(schema, query);
    expect(result.data.year).toEqual(1993);
  })

  it('can be used as an input type', async () => {

    let query = `
      mutation foo {
        add_year(
	  year: {year: 1993}
	)
      }
    `;

    let result = await graphql(schema, query);
    //Year gets stringifed on the way out.
    expect(result.data.add_year.year).toEqual("1993");
  })

  it('rejects non-numeric values', async () => {

    let query = `
      mutation foo {
        add_year(
	  year: {year: "1993"}
	)
      }
    `;

    let result = await graphql(schema, query);
    //Year gets stringifed on the way out.
    expect(result.errors).toExist();
    expect(result.errors[0].message).toInclude('Can only be an integer.');
  })

  it('rejects non-integer values', async () => {

    let query = `
      mutation foo {
        add_year(
	  year: {year: 1993.01}
	)
      }
    `;

    let result = await graphql(schema, query);
    //Year gets stringifed on the way out.
    expect(result.errors).toExist();
    expect(result.errors[0].message).toInclude('Can only be an integer.');
  })

  it('rejects years beyond the current year', async () => {

    let query = `
      mutation foo {
        add_year(
	  year: {year: 2100}
	)
      }
    `;

    let result = await graphql(schema, query);
    //Year gets stringifed on the way out.
    expect(result.errors).toExist('A year in the future was accepted when it should not have been.');
    expect(result.errors[0].message).toInclude('between 1600 and the current year');
  })

  it('rejects years earlier than 1600', async () => {

    let query = `
      mutation foo {
        add_year(
	  year: {year: 1559}
	)
      }
    `;

    let result = await graphql(schema, query);
    //Year gets stringifed on the way out.
    expect(result.errors).toExist('A year in the distant past was accepted when it should not have been.');
    expect(result.errors[0].message).toInclude('between 1600 and the current year');
  })

})
