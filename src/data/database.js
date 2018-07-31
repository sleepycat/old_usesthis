import { aql } from 'arangojs'

export default async function dbinit(db) {
  // There is/should be only one graph.
  let graphs = await db.listGraphs()
  let graph = graphs[0]._key

  return {
    technologiesForOrganization: async id => {
      let query = aql`
      FOR v IN 2 OUTBOUND ${id} edges
        FILTER v.type == 'technology'
          RETURN v
      `
      let results = await db.query(query)
      return results.all()
    },
    languagesForOrganization: async org => {
      let query = aql`
      FOR vertex IN 2 OUTBOUND ${org} GRAPH ${graph}
        FILTER vertex.type == "technology" && vertex.category == "language"
          RETURN DISTINCT vertex
      `
      let results = await db.query(query)
      return results.all()
    },
    orgsAndLanguagesForLocation: async id => {
      let query = aql`
      FOR vertex IN 2 INBOUND ${id} GRAPH ${graph} OPTIONS {bfs: true, uniqueVertices: 'global'}
        FILTER vertex.type == "organization"
          LET technologies = (
            FOR v IN 2 OUTBOUND vertex GRAPH ${graph} OPTIONS {bfs: true, uniqueVertices: 'global'}
              FILTER v.type == "technology" && v.category == "language"
                RETURN v
          )
      RETURN MERGE(vertex, {technologies: FLATTEN(technologies)})
      `
      let result = await db.query(query)
      return result.all()
    },

    orgsAndTechnologiesForLocation: async id => {
      let query = aql`
      FOR vertex IN 2 INBOUND ${id} GRAPH ${graph} OPTIONS {bfs: true, uniqueVertices: 'global'}
        FILTER vertex.type == "organization"
          LET technologies = (
            FOR v IN 2 OUTBOUND vertex GRAPH ${graph} OPTIONS {bfs: true, uniqueVertices: 'global'}
              FILTER v.type == "technology"
                RETURN v
          )
      RETURN MERGE(vertex, {technologies: FLATTEN(technologies)})
      `
      let result = await db.query(query)
      return result.all()
    },

    orgsForLocation: async id => {
      let query = aql`
      FOR vertex IN 2 INBOUND ${id} GRAPH ${graph} OPTIONS {bfs: true, uniqueVertices: 'global'}
        FILTER vertex.type == "organization"
        RETURN vertex
      `
      let result = await db.query(query)
      return await result.all()
    },

    organizationByName: async name => {
      let query = aql`
      FOR v IN vertices
        FILTER v.type == "organization" && v.name == ${name}
        LIMIT 1
          RETURN v
      `
      let results = await db.query(query)
      return results.next()
    },

    locationByID: async id => {
      let query = aql`
        FOR v IN vertices
          FILTER TO_STRING(v._key) == TO_STRING(${id})
          RETURN v
      `
      let result = await db.query(query)
      return result.next()
    },

    locationsWithinBounds: async (swLat, swLng, neLat, neLng) => {
      let query = aql`
				RETURN WITHIN_RECTANGLE(vertices, ${swLat}, ${swLng}, ${neLat}, ${neLng})
      `
      let results = await db.query(query)
      let allResults = await results.all()
      return allResults[0]
    },

    addOrganization: organization => {
      //This is a function that will be stringified and sent to Arango
      //to be run in a transaction.
      var action = String(function(args) {
        var db = require('org/arangodb').db
        var orgData = args[0]
        var graph = args[1]

        // find or create an organization
        var unsavedOrganization = {
          founding_year: orgData.founding_year,
          type: 'organization',
          name: orgData.name,
          url: orgData.url,
          code: orgData.code,
        }

        var organizationQuery = `
          UPSERT {name: @orgName}
          INSERT @unsavedOrganization
          UPDATE {} IN vertices
          RETURN NEW
				`
        var organization = db
          ._query(organizationQuery, {
            orgName: unsavedOrganization.name,
            unsavedOrganization,
          })
          .toArray()[0]

        orgData.locations.map(function(unsavedLocation) {
          var latLng = { lat: unsavedLocation.lat, lng: unsavedLocation.lng }
          var locationQuery = `
            UPSERT @latLng
            INSERT MERGE(@unsavedLocation, {type: "location"})
            UPDATE {} IN vertices
            RETURN NEW
					`
          var location = db
            ._query(locationQuery, { latLng, unsavedLocation })
            .toArray()[0]

          // Is there an office that connects the org to the location?
          //org ---works_in ---> office ---located_at---> location
          // Does this org already have an office at this location?

          var hasOffice = `
      FOR v, e IN OUTBOUND SHORTEST_PATH @organization_id TO @location_id GRAPH @graph
        FILTER e.type == "works_in"
            RETURN v
      `
          var office = db
            ._query(hasOffice, {
              graph,
              organization_id: organization._id,
              location_id: location._id,
            })
            .toArray()[0]

          if (typeof office == 'undefined') {
            office = db
              ._query('INSERT {type: "office"} IN vertices RETURN NEW')
              .toArray()[0]
            // link the org to the office
            var orgOfficeEdgeQuery = `
        INSERT {_to: @office_id, _from: @organization_id, type: "works_in"} IN edges RETURN NEW
        `
            // eslint-disable-next-line no-unused-vars
            var orgOfficeEdge = db
              ._query(orgOfficeEdgeQuery, {
                office_id: office._id,
                organization_id: organization._id,
              })
              .toArray()[0]

            //and finally link the location and the office
            var locOfficeEdgeQuery = `
        INSERT {_to: @location_id, _from: @office_id, type: "located_at"} IN edges RETURN NEW
        `
            // eslint-disable-next-line no-unused-vars
            var locOfficeEdge = db
              ._query(locOfficeEdgeQuery, {
                location_id: location._id,
                office_id: office._id,
              })
              .toArray()[0]
          }

          orgData.technologies.map(function(unsavedTechnology) {
            var technologyQuery = `
        UPSERT @unsavedTechnology INSERT MERGE(@unsavedTechnology, {type: "technology"}) UPDATE {} IN vertices RETURN NEW
        `
            var technology = db
              ._query(technologyQuery, { unsavedTechnology: unsavedTechnology })
              .toArray()[0]

            var technologyEdgeQuery = `
        INSERT {_to: @technology_id, _from: @office_id, type: "uses"} IN edges RETURN NEW
        `
            // eslint-disable-next-line no-unused-vars
            var technologyEdge = db
              ._query(technologyEdgeQuery, {
                technology_id: technology._id,
                office_id: office._id,
              })
              .toArray()[0]
          })
        })

        return organization
      })

      return db.transaction({ write: ['vertices', 'edges'] }, action, [
        organization,
        graph,
      ])
    },
  }
}
