let env = process.env.NODE_ENV || "development"
let dbConfig = require('../arangodb_config')[env]
export let db = require('arangojs')(dbConfig)
let aqlQuery = require('arangojs').aqlQuery

export async function technologiesForOrganization(id) {
  let query = aqlQuery`
  FOR v,e,p IN 2 OUTBOUND ${id} edges
    FILTER v.type == 'technology'
      RETURN v
  `
  let results = await db.query(query)
  return results.all()
}

export async function orgsAndTechnologiesForLocation(id) {
  //TODO: clean this up
  let aql = `
  LET organizations = (RETURN GRAPH_NEIGHBORS(@graph, @example, { maxDepth: 2, includeData: true, neighborExamples: [{type: "organization"}], uniqueness:{vertices: "global", edges: "global"} }))
  FOR org IN FLATTEN(organizations)
  LET technologies = (RETURN GRAPH_NEIGHBORS(@graph, org, { maxDepth: 2, includeData: true, neighborExamples: [{type: "technology", category: "language"}], uniqueness:{vertices: "global", edges: "global"} }))
  RETURN MERGE(org, {technologies: FLATTEN(technologies)})
  `
  let bindvars = { "example": id, graph: "usesthis" };
  let result = await db.query(aql, bindvars )
  return result.all()
}

export async function orgsForLocation(id) {
  let graph = 'usesthis'
  let query = aqlQuery`RETURN GRAPH_NEIGHBORS(${graph}, ${id}, {includeData: true, maxDepth: 2, neighborExamples: [{type: 'organization'}]})`
  let result = await db.query(query)
  let allResults = await result.all()
  return allResults[0]
}

export async function organizationByName(name) {
  let query = aqlQuery`
    FOR v IN vertices
      FILTER v.type == "organization" && v.name == ${name}
      LIMIT 1
        RETURN v
    `
  let results =  await db.query(query)
  return results.next()
}

export async function locationByID(id) {
  let query = aqlQuery`
    FOR v IN vertices
      FILTER TO_STRING(v._key) == TO_STRING(${id})
      RETURN v
  `
  let result = await db.query(query)
  return result.next()
}

export async function locationsWithinBounds(swLat, swLng, neLat, neLng) {
  let query = aqlQuery`
    RETURN WITHIN_RECTANGLE(vertices, ${swLat}, ${swLng}, ${neLat}, ${neLng})
  `
  let results = await db.query(query)
  let allResults = await results.all()
  return allResults[0]
}
