const path = require('path')
require('dotenv-safe').config({
  path: path.resolve(process.cwd(), '.env.test'),
})
