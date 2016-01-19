

var request = require('supertest')
  , expect = require('expect')
  , config = require('../arangodb_config')[process.env.NODE_ENV]
  , db = require('arangojs')(config);

describe('Arangodb', () => {

  before(()=>{
    db.truncate()
  })

  after(()=>{
    db.truncate()
  })

  it('can make a db connection', done => {
     db.collections(function(err, collections){
       expect(err).toBe(null);
       done();
     });
  })

  it('find vertices and edges collections', done => {
     db.collections(function(err, collections){
       let collectionNames = collections.map(function(c){return c.name});
       expect(collectionNames).toInclude('vertices');
       expect(collectionNames).toInclude('edges');
       done();
     });
  })

  it('can query the database with AQL', async (done) => {
    let vertices = await db.collection('vertices');
    await vertices.save({hello: 'world'});

    let cursor = await db.query('FOR doc IN vertices FILTER doc.hello == "world" RETURN doc');
    let result = await cursor.next();

    expect(result.hello).toEqual("world");
    done();
  })

});



