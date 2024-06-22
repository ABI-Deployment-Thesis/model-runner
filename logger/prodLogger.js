const { format, createLogger, transports } = require('winston')
const { timestamp, combine, errors, json } = format

function buildProdLogger() {
    return createLogger({
        level: 'info',
        format: combine(
            timestamp(),
            errors({ stack: true }),
            json()
        ),
        defaultMeta: { service: 'user-service' },
        transports: [
            new transports.Console(),
            new transports.File({ filename: 'error.log', level: 'error' }),
            new transports.File({ filename: 'combined.log' })
        ],
    });
}

module.exports = buildProdLogger()