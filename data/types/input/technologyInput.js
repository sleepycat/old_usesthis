import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

let TechnologyInput = new GraphQLInputObjectType({
  name: 'technology',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    category: { type: GraphQLString }
  }
});

export default TechnologyInput
