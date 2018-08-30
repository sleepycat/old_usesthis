const Server = require('./src/server').default
const {db} = require('./src/db')

Server(db).then(server => {
  server.listen({ port: 3000 }, () =>
    // eslint-disable-next-line no-console
    console.log(`🚀 Usesthis API ready at http://localhost:3000`),
  )
}).catch(console.log)
