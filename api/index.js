const Server = require('./src/server').default

const server = Server()

server.listen({ port: 3000 }, () =>
  // eslint-disable-next-line no-console
  console.log(
    `🚀 Usesthis API ready at http://localhost:3000`,
  ),
)
