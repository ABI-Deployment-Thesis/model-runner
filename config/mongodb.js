const mongoose = require('mongoose')

const con = async function () {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL)
        logger.info('Connected to mongo DB')
    } catch (err) {
        logger.error(err)
    }
}

module.exports = {
    con
}