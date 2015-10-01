

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

  it('can query the database with AQL', done => {
    var collection = db.collection('vertices')
    .then((vertices)=>{ return vertices.save({hello: 'world'}) })
    .then((result)=>{
      return db.query('FOR doc IN vertices FILTER doc.hello == "world" RETURN doc')})
    .then((cursor) =>{ return cursor.next() })
    .then((doc)=>{
      expect(doc.hello).toEqual("world");
      done();
    });
  });
});



