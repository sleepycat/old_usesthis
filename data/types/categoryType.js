import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'category',
  values: {
    FRAMEWORKS: {value: "frameworks"},
    LIBRARIES: {value: "library"},
    TOOLS: {value: "tools"},
    STORAGE: {value: "storage"},
    LANGUAGES: {value: "language"}
  }
});
