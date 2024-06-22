const buildDevLogger = require('./devLogger')
const buildProdLogger = require('./prodLogger')

let logger = null
if (process.env.NODE_ENV === 'development') {
    logger = buildDevLogger
} else {
    logger = buildProdLogger
}

module.exports = logger