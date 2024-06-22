const { Schema, model } = require('mongoose')

const InputFeaturesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    result: {
        type: String,
        required: false
    }
}, { _id: false })

const ModelRun = new Schema({
    model_id: {
        type: String,
        required: true
    },
    input_features: {
        type: [InputFeaturesSchema],
        required: true
    },
    state: {
        type: String,
        enum: ['queue', 'building', 'running', 'finished', 'failed'],
        required: true,
        default: 'queue'
    },
    container_id: {
        type: String,
        required: false
    },
    container_exit_code: {
        type: Number,
        required: false
    },
    result: {
        type: String,
        required: false
    }
}, { timestamps: true, versionKey: false })

module.exports = model('model_run', ModelRun)
