const jwt = require('../../utils/jsonwebtoken')

async function isAuthenticated(req, res, next) {
    try {
        const { id } = await jwt.decodeSessionToken(jwt.getTokenFromBearer(req.headers.authorization))
        req.user = { id }
        next()
    } catch (err) {
        logger.error(err)
        res.status(401).json({ message: 'Unauthorized' })
    }
}

module.exports = {
    isAuthenticated
}
