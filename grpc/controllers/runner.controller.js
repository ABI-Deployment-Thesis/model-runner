const mongoose = require('mongoose')

const ModelRun = require('../../models/modelRun')

async function UpdateRunninState(call, callback) {
    try {
        logger.debug(`Received gRPC call: ${JSON.stringify(call.request)}`)

        const { run_id, state, container_id, container_exit_code, logs } = call.request

        if (!mongoose.Types.ObjectId.isValid(run_id)) {
            logger.error(`model_id ${run_id} not valid`)
            return callback(null, { resolved: true, err: '' })
        }

        const filter = { _id: run_id }
        const update = { state: state, container_id: container_id, container_exit_code: container_exit_code, result: logs }

        await ModelRun.findOneAndUpdate(filter, update)
        callback(null, { resolved: true, err: '' })
    } catch (err) {
        logger.error(err)
        callback(null, { resolved: false, err: err })
    }
}

module.exports = {
    UpdateRunninState
}