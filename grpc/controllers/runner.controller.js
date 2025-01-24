const mongoose = require('mongoose')

const ModelRun = require('../../models/modelRun')
const rabbitmqSender = require('../../rabbitmq/sender')

const QUEUE_NAME = process.env.RABBITMQ_ML_RESPONSES_QUEUE || 'ml_responses'

async function UpdateRunninState(call, callback) {
    try {
        logger.debug(`Received gRPC call: ${JSON.stringify(call.request)}`)

        const { run_id, state, result, logs } = call.request

        if (!mongoose.Types.ObjectId.isValid(run_id)) {
            logger.error(`model_id ${run_id} not valid`)
            return callback(null, { resolved: true, err: '' })
        }

        const filter = { _id: run_id }
        const update = { state: state, result: result, logs: logs }

        const run = await ModelRun.findOne(filter)
        if (run.rabbitmq_transaction_id != '' && (state == 'finished' || state == 'failed')) {
            await rabbitmqSender(QUEUE_NAME, {
                req_id: run.rabbitmq_transaction_id,
                answer: result
            })
        }
        run.set(update)
        await run.save()
        callback(null, { resolved: true, err: '' })
    } catch (err) {
        logger.error(err)
        callback(null, { resolved: false, err: err })
    }
}

module.exports = {
    UpdateRunninState
}