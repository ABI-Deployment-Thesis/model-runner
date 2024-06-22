const path = require('path')

const mongoose = require('mongoose')

const ModelRun = require('../../models/modelRun')
const { getModelSync } = require('../../grpc/clients/modelMgmt')
const rabbitmqSender = require('../../rabbitmq/sender')

async function getRuns(req, res) {
    try {
        let runs
        if (req.query.model_id) {
            runs = await ModelRun.find({ model_id: req.query.model_id})
        } else {
            runs = await ModelRun.find()
        }
        res.status(200).json(runs)
    } catch (err) {
        logger.error(err)
        res.status(400).json({ error: err })
    }
}

async function getRunsById(req, res) {
    try {
        const runs = await ModelRun.find({ _id: req.params.run_id})
        res.status(200).json(runs)
    } catch (err) {
        logger.error(err)
        res.status(400).json({ error: err })
    }
}

async function runModel(req, res, next) {
    try {
        const id = new mongoose.Types.ObjectId()
        const model_id = req.body.model_id
        const input_features = req.body.input_features

        const model = await getModelSync({ model_id: model_id })
        await validateInput(model, input_features)

        const newModelRun = await new ModelRun({
            _id: id,
            model_id: model_id,
            input_features: input_features
        })
        await newModelRun.validate()

        const message = {
            run_id: id,
            folder_path: path.dirname(model.file_path),
            model_filename: path.basename(model.file_path),
            input_features: JSON.stringify(input_features),
        }
        await rabbitmqSender(process.env.RABBITMQ_DOCKER_ENGINE_QUEUE, message)

        await newModelRun.save()
        res.status(201).json({ message: `Request to run model sent successfully with ID ${id}` })
    } catch (err) {
        logger.error(err)
        return res.status(400).json({ error: err.message })
    }
}

function validateInput(model, input_features) {
    // Check if each feature exists in the input_features object and validate its value
    for (const feature of model.features) {
        const inputFeature = input_features.find(f => f.name === feature.name)
        if (!inputFeature) {
            throw new Error(`Feature '${feature.name}' missing`)
        }

        // Validate the value against the feature type
        if (feature.type == 'int' || feature.type == 'float') {
            feature.type = 'number'
        }
        if (feature.type == 'bool') {
            feature.type = 'boolean'
        }


        if (typeof inputFeature.value !== feature.type) {
            throw new Error(`Invalid value type for feature '${feature.name}'`)
        }
    }
    logger.debug('Input is valid')
}

module.exports = {
    getRuns,
    getRunsById,
    runModel
}