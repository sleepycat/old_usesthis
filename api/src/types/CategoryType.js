const { GraphQLEnumType } = require('graphql')

module.exports.CategoryType = new GraphQLEnumType({
  name: 'Category',
  values: {
    FRAMEWORKS: { value: 'frameworks' },
    LIBRARIES: { value: 'library' },
    TOOLS: { value: 'tools' },
    STORAGE: { value: 'storage' },
    LANGUAGES: { value: 'language' },
    OPERATING_SYSTEM: { value: 'os' },
    SERVER: { value: 'server' },
  },
})
