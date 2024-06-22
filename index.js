// Starting logger
const logger = require('./logger')
global.logger = logger

logger.info(`Current environment: ${process.env.NODE_ENV}`)
if (process.env.NODE_ENV == 'development') {
    require('dotenv').config({ path: './.env.development' })
}

// Database
const mongoDB = require('./config/mongodb')
mongoDB.con()

// Import the http server and start it
require('./http')

require('./grpc')