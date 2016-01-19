import request from 'supertest'
import expect from 'expect'

let config = require('../arangodb_config')[process.env.NODE_ENV]
let db = require('arangojs')(config);

describe('Arangodb', () => {

  before(()=>{
    db.truncate()
  })

  after(()=>{
    db.truncate()
  })

  it('find vertices and edges collections', async (done) => {
    let collections = await db.collections();
    let collectionNames = collections.map((c) => {return c.name});
    expect(collectionNames).toInclude('vertices');
    expect(collectionNames).toInclude('edges');
    done();
  });

  it('can query the database with AQL', async (done) => {
    let vertices = await db.collection('vertices');
    await vertices.save({hello: 'world'});

    let cursor = await db.query('FOR doc IN vertices FILTER doc.hello == "world" RETURN doc');
    let result = await cursor.next();

    expect(result.hello).toEqual("world");
    done();
  })

});



