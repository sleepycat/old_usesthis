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

export async function languagesForOrganization(org) {
  let graph = 'usesthis'
  let query = aqlQuery`
  FOR vertex IN 2 OUTBOUND ${org} GRAPH ${graph}
    FILTER vertex.type == "technology" && vertex.category == "language"
      RETURN DISTINCT vertex
  `
  let results = await db.query(query)
  return results.all()
}

export async function orgsAndLanguagesForLocation(id) {
  let graph = 'usesthis'
  let aql = aqlQuery`
  LET organizations = (RETURN GRAPH_NEIGHBORS(${graph}, ${id}, { maxDepth: 2, includeData: true, neighborExamples: [{type: "organization"}], uniqueness:{vertices: "global", edges: "global"} }))
  FOR org IN FLATTEN(organizations)
  LET technologies = (RETURN GRAPH_NEIGHBORS(${graph}, org, { maxDepth: 2, includeData: true, neighborExamples: [{type: "technology", category: "language"}], uniqueness:{vertices: "global", edges: "global"} }))
  RETURN MERGE(org, {technologies: FLATTEN(technologies)})
  `
  let result = await db.query(aql)
  return result.all()
}

export async function orgsAndTechnologiesForLocation(id) {
  let graph = 'usesthis'
  let aql = aqlQuery`
  LET organizations = (RETURN GRAPH_NEIGHBORS(${graph}, ${id}, { maxDepth: 2, includeData: true, neighborExamples: [{type: "organization"}], uniqueness:{vertices: "global", edges: "global"} }))
  FOR org IN FLATTEN(organizations)
  LET technologies = (RETURN GRAPH_NEIGHBORS(${graph}, org, { maxDepth: 2, includeData: true, neighborExamples: [{type: "technology"}], uniqueness:{vertices: "global", edges: "global"} }))
  RETURN MERGE(org, {technologies: FLATTEN(technologies)})
  `
  let result = await db.query(aql)
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

export async function addOrganization(organization) {
  //This is a function that will be stringified and sent to Arango
  //to be run in a transaction.
  var action = String(function (args) {
    var db = require('org/arangodb').db;
    var orgData = args[0];

    // find or create an organization
    var unsavedOrganization = {"founding_year": orgData.founding_year,"type":"organization","name": orgData.name, "url": orgData.url, "code": orgData.code}
    var organizationQuery = `
    UPSERT {name: @orgName} INSERT @unsavedOrganization UPDATE {} IN vertices RETURN NEW
    `
    var organization = db._query(organizationQuery, {orgName: unsavedOrganization.name, unsavedOrganization}).toArray()[0]

    orgData.locations.map(function(unsavedLocation){

      var latLng = {lat: unsavedLocation.lat, lng: unsavedLocation.lng}
      var locationQuery = `
      UPSERT @latLng INSERT MERGE(@unsavedLocation, {type: "location"}) UPDATE {} IN vertices RETURN NEW
      `;
      var location = db._query(locationQuery, {latLng, unsavedLocation}).toArray()[0]

      // Is there an office that connects the org to the location?
      //org ---works_in ---> office ---located_at---> location
      // Does this org already have an office at this location?
      var hasOffice = `
      LET path = (RETURN GRAPH_SHORTEST_PATH(@graph, @organization_id, @location_id, {stopAtFirstMatch: true, direction: "outbound", edgeExamples: [{type: "works_in"}, {type: "located_at"}], includeData: true})[0]) RETURN path[0].vertices[1]
      `
      var office = db._query(hasOffice, {graph: "usesthis", organization_id: organization._id, location_id: location._id}).toArray()[0]


      if(office === null){
        office = db._query('INSERT {type: "office"} IN vertices RETURN NEW').toArray()[0]
        // link the org to the office
        var orgOfficeEdgeQuery = `
        INSERT {_to: @office_id, _from: @organization_id, type: "works_in"} IN edges RETURN NEW
        `
        var orgOfficeEdge =  db._query(orgOfficeEdgeQuery, {office_id: office._id, organization_id: organization._id}).toArray()[0]

        //and finally link the location and the office
        var locOfficeEdgeQuery = `
        INSERT {_to: @location_id, _from: @office_id, type: "located_at"} IN edges RETURN NEW
        `
        var locOfficeEdge = db._query(locOfficeEdgeQuery, {location_id: location._id, office_id: office._id}).toArray()[0]
      }

      orgData.technologies.map(function(unsavedTechnology) {
        var technologyQuery = `
        UPSERT @unsavedTechnology INSERT MERGE(@unsavedTechnology, {type: "technology"}) UPDATE {} IN vertices RETURN NEW
        `;
        var technology = db._query(technologyQuery, {unsavedTechnology: unsavedTechnology}).toArray()[0]

        var technologyEdgeQuery = `
        INSERT {_to: @technology_id, _from: @office_id, type: "uses"} IN edges RETURN NEW
        `;
        var technologyEdge = db._query(technologyEdgeQuery, {technology_id: technology._id, office_id: office._id}).toArray()[0]
      })
    })

    return organization
  });

  return  db.transaction({write: ['vertices', 'edges']}, action, [organization])
}
