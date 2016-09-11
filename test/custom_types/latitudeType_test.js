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

import LatitudeType from '../../src/data/types/latitudeType'

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      lat: {
	type: LatitudeType,
	args: {},
	resolve: () => {
	  return 45
	},
      }
    })
  }),
  mutation: new GraphQLObjectType({
    name: 'mutation',
    fields: () => ({
      add_latitude: {
	type: LatitudeType,
	args: {
	  coords: { type: new GraphQLInputObjectType({
            name: 'URLinput',
            fields: { lat: { type: new GraphQLNonNull(LatitudeType) } }
          })}
        },
	resolve: (source, args) => {
	  return args.coords.lat
	},
      }
    })
  })
});

describe('LatitudeType', () => {

  it('correctly returns something using the lat type', async () => {

    let query = `
      query fooQuery {
	lat
      }
    `;

    let result = await graphql(schema, query);
    expect(result.data.lat).toEqual(45);
  })

  it('can be used as an type with input objects', async () => {

    let query = `
      mutation foo {
        add_latitude(
	  coords: {lat: 45.423678}
	)
      }
    `;

    let result = await graphql(schema, query);
    expect(result.data.add_latitude).toEqual(45.423678);
  })

  it('will throw and error for values beyond +90', async () => {

    let query = `
      mutation foo {
        add_latitude(
	  coords: {lat: 100.00}
	)
      }
    `;

    let result = await graphql(schema, query);
    expect(result.errors).toExist();
    expect(result.errors[0].message).toInclude("A valid latitude is between +90 and -90");
  })

  it('90 exactly is OK', async () => {

    let query = `
      mutation foo {
        add_latitude(
	  coords: {lat: 90.00}
	)
      }
    `;

    let result = await graphql(schema, query);
    expect(result.data.add_latitude).toEqual(90.00);
  })

  it('Values below -90 are rejected', async () => {

    let query = `
      mutation foo {
        add_latitude(
	  coords: {lat: -93.00}
	)
      }
    `;

    let result = await graphql(schema, query);
    expect(result.errors).toExist();
    expect(result.errors[0].message).toInclude("A valid latitude is between +90 and -90");
  })
})

