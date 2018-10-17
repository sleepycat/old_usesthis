import {
  graphql,
  GraphQLSchema,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLNonNull,
} from 'graphql'

import CategoryType from '../../src/data/types/categoryType'

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      category: {
        type: CategoryType,
        resolve: () => 'frameworks',
      },
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'mutation',
    fields: () => ({
      add_category: {
        type: CategoryType,
        args: {
          category: {
            type: new GraphQLInputObjectType({
              name: 'CategoryInput',
              fields: { category: { type: new GraphQLNonNull(CategoryType) } },
            }),
          },
        },
        resolve: (source, args) => {
          return args.category.category
        },
      },
    }),
  }),
})

describe('The CategoryType', () => {
  it('can be used in a schema', async () => {
    let query = `
      query fooQuery {
        category
      }
    `

    let result = await graphql(schema, query)
    expect(result.data.category).toEqual('FRAMEWORKS')
  })

  it('can be used as an input type', async () => {
    let query = `
      mutation {
        add_category(category: {category: TOOLS})
      }
    `

    let result = await graphql(schema, query)
    //Year gets stringifed on the way out.
    expect(result.data.add_category).toEqual('TOOLS')
  })

  it('rejects bad values', async () => {
    let query = `
      mutation foo {
        add_category(category: {category: ASDF})
      }
    `

    let result = await graphql(schema, query)
    expect(result.errors).toBeDefined()

    let [err] = result.errors
    expect(err.message).toContain('Expected type category, found ASDF.')
  })
})
