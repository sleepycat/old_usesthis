require('babel-polyfill')

import {
  graphql,
  GraphQLSchema,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql'

import LongitudeType from '../../src/data/types/longitudeType'

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      lng: {
        type: LongitudeType,
        args: {},
        resolve: () => {
          return 180
        },
      },
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'mutation',
    fields: () => ({
      add_longitude: {
        type: LongitudeType,
        args: {
          coords: {
            type: new GraphQLInputObjectType({
              name: 'LongitudeInput',
              fields: { lng: { type: new GraphQLNonNull(LongitudeType) } },
            }),
          },
        },
        resolve: (source, args) => {
          return args.coords.lng
        },
      },
    }),
  }),
})

describe('LongitudeType', () => {
  it('correctly returns something using the lng type', async () => {
    let query = `
      query fooQuery {
	lng
      }
    `

    let result = await graphql(schema, query)
    expect(result.data.lng).toEqual(180)
  })

  it('can be used as an type with input objects', async () => {
    let query = `
      mutation foo {
        add_longitude(coords: {lng: -75.728408})
      }
    `

    let result = await graphql(schema, query)
    expect(result.data.add_longitude).toEqual(-75.728408)
  })

  it('will throw and error for values beyond +180', async () => {
    let query = `
      mutation foo {
        add_longitude( coords: {lng: 1000.000})
      }
    `

    let result = await graphql(schema, query)
    expect(result.errors).toBeTruthy()
    expect(result.errors[0].message).toContain(
      'A valid longitude is between +180 and -180',
    )
  })

  it('180 exactly is OK', async () => {
    let query = `
      mutation foo {
        add_longitude(coords: {lng: 180.00})
      }
    `

    let result = await graphql(schema, query)
    expect(result.data.add_longitude).toEqual(180.0)
  })

  it('Values below -180 are rejected', async () => {
    let query = `
      mutation foo {
        add_longitude(coords: {lng: -193.00})
      }
    `

    let result = await graphql(schema, query)
    expect(result.errors).toBeTruthy()
    expect(result.errors[0].message).toContain(
      'A valid longitude is between +180 and -180',
    )
  })
})
