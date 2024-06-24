// Config port
const port = process.env.HTTP_PORT

// Import the express package
const express = require('express')

// Creates an express app
const app = express()

// Start the server
app.listen(port, function (err) {
    if (!err) {
        logger.info(`HTTP server hosted on port ${port}`)
    } else {
        logger.error(err)
    }
})

// Export the app
module.exports = app
require('./loader.js')