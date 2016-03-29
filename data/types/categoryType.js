export default CategoryType = new GraphQLEnumType({
  name: 'RGB',
  values: {
    RED: { value: 0 },
    GREEN: { value: 1 },
    BLUE: { value: 2 }
  }
});
