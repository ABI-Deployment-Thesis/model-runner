const path = require('path')
const fs = require('fs')

const mongoose = require('mongoose')
const unzipper = require('unzipper')

const ModelRun = require('../../models/modelRun')
const { getModelSync, getModelsSync } = require('../../grpc/clients/modelMgmt')
const rabbitmqSender = require('../../rabbitmq/sender')

async function getRuns(req, res) {
    try {
        const models = await getModelsSync(req.headers.authorization)

        let runs = []
        if (req.query.model_id) {
            runs = await ModelRun.find({ model_id: req.query.model_id })
        } else {
            runs = await ModelRun.find();
        }

        const validatedRuns = validateRunsAgainstModels(runs, models)

        res.status(200).json(validatedRuns)
    } catch (err) {
        logger.error(err)
        res.status(400).json({ error: err.message })
    }
}

async function getRunsById(req, res) {
    try {
        const run = await ModelRun.findOne({ _id: req.params.run_id })
        if (!run) return res.status(404).json({ error: 'Not Found' })

        const models = await getModelsSync(req.headers.authorization)
        const validatedRun = validateRunsAgainstModels([run], models)
        if (validatedRun.length == 0) return res.status(404).json({ error: 'Not Found' })

        res.status(200).json(validatedRun[0])
    } catch (err) {
        logger.error(err)
        res.status(400).json({ error: err.message })
    }
}

async function runModel(req, res, next) {
    try {
        const id = new mongoose.Types.ObjectId()
        const model_id = req.params.model_id
        const input_features = req.body.input_features || []

        const model = await getModelSync({ model_id: model_id }, req.headers.authorization)
        await validateInput(model, input_features)

        const newModelRun = await new ModelRun({
            _id: id,
            model_id: model_id,
            input_features: input_features
        })
        await newModelRun.validate()

        let message
        switch (model.type) {
            case 'predictive':
                message = {
                    run_id: id,
                    type: model.type,
                    folder_path: path.dirname(model.file_path),
                    model_filename: path.basename(model.file_path),
                    input_features: JSON.stringify(input_features)
                }
                break
            case 'optimization':
                const zipPath = req.file.path
                const destPath = path.join(path.dirname(zipPath), id.toString())
                await unzip(zipPath, destPath)
                await fs.rmSync(zipPath, { recursive: true, force: true })
                await fs.cpSync(model.file_path, destPath, {recursive: true})
                message = {
                    run_id: id,
                    type: model.type,
                    folder_path: destPath
                }
                break
            default:
                throw new Error('Invalid model type')
        }

        await rabbitmqSender(process.env.RABBITMQ_DOCKER_ENGINE_QUEUE, message)

        await newModelRun.save()
        res.status(201).json({ message: `Request to run model sent successfully with ID ${id}` })
    } catch (err) {
        logger.error(err)
        return res.status(400).json({ error: err.message })
    }
}

async function unzip(zipPath, destPath) {
    const directory = await unzipper.Open.file(zipPath);
    await directory.extract({ path: destPath })
}

function validateRunsAgainstModels(runs, models) {
    const validatedRuns = []

    runs.forEach(run => {
        const model = models.find(model => model._id.toString() === run.model_id.toString())
        if (model && !model.deleted) {
            run._doc.model_name = model.name
            validatedRuns.push(run)
        }
    })

    return validatedRuns
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