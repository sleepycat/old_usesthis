# Usesthis

This is a rewrite of usesth.is aimed at building on graphql and react.

## Getting set up

### Database assumptions

There are a few assumptions that are currently made about the state of the database. First it assumes that [ArangoDB](https://www.arangodb.com/download/) is installed on your system. It works with the current version of Arangodb.

 * The following databases exist:
    * usesthis_production
    * usesthis_development
    * usesthis_test
 * Those database contain the following collections:
    * vertices (document type)
    * edges (edge type)
 * A graph named `usesthis` has been created linking the vertices &
   edges collections
 * A [geo index](https://docs.arangodb.com/IndexHandling/Geo.html) exists on the lat & lng propertices of the vertices
   collection

These prerequistes can be created using the ArangoDB [admin interface](https://docs.arangodb.com/WebInterface/index.html).

### Env vars:

There are two required environmental variables:
```sh
USESTHIS_DEVELOPMENT_DB_URL=http://foo:bar@127.0.0.1:8529
USESTHIS_DEVELOPMENT_DB_NAME=usesthis_development
```
A third variable `PORT` is only used in production.

### Getting the application going

```sh
git clone https://github.com/sleepycat/usesthis.git
cd usesthis
yarn
yarn start
```

This should be sufficient to bring up the application listening on port
3000.

### Dumping and Loading Data

Dumping and restoring data can be with the `arangodump` and
`arangorestore` commands.

Graph definition's are stored in the system collection so it needs to be
included in both the dump and restore. The traversal statements in many
of the functions in data/database.js depend on this graph to exist.

```sh
# Dumping vertices, edges and the system collection
arangodump --server.database usesthis_development --output-directory arango_dump_system --overwrite true --include-system-collections true

# Restoring to a remote host:
arangorestore --server.endpoint 'tcp://ec2-54-213-157-146.us-west-2.compute.amazonaws.com:8529' --create-database true --server.database usesthis_production --input-directory arango_dump_system --overwrite true --include-system-collections true

# Restoring to localhost
arangorestore --server.endpoint 'tcp://127.0.0.1:8529' --create-database true --server.database usesthis_production --input-directory arango_dump_system --overwrite true --include-system-collections true
```

### Running the tests

The server side code has tests that can be run like this:

```sh
mike@longshot:~/projects/usesthis☺  yarn test
```

## Deployment

Deployment is currently on a single AWS EC2 micro instance.
The first step is to build for production:

```sh
yarn run build
# When the bundle is created and the image is built:
docker push mikewilliamson/usesthis
```

SSH into the production instance and docker pull the new image.
Starting everthing with docker-compose looks like this:

```sh
USESTHIS_PRODUCTION_DB_NAME="usesthis_production" USESTHIS_PRODUCTION_DB_URL="http://u:p@arangodb:8529" PORT=80 docker-compose up -d
```

