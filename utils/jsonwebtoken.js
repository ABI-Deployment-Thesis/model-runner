const jwt = require('jsonwebtoken')

function getTokenFromBearer(bearerToken) {
    const PREFIX = 'Bearer '
    if (bearerToken && bearerToken.startsWith('Bearer ')) {
        return bearerToken.replace(PREFIX, '')
    }
    return ''
}

async function generateSessionToken(string) {
    return new Promise(async (resolve, reject) => {
        try {
            const token = jwt.sign({ id: string }, process.env.JWT_SESSION_PASS)
            resolve(token)
        } catch (err) {
            reject(err)
        }
    })
}

async function decodeSessionToken(token) {
    return new Promise(async (resolve, reject) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SESSION_PASS)
            resolve(decoded)
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = {
    getTokenFromBearer,
    generateSessionToken,
    decodeSessionToken
}