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
        required: true,
        default: []
    },
    state: {
        type: String,
        enum: ['queue', 'building', 'running', 'finished', 'failed'],
        required: true,
        default: 'queue'
    },
    result: {
        type: String,
        required: false,
        default: ''
    },
    logs: {
        type: String,
        required: false,
        default: ''
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    versionKey: false
})

module.exports = model('model_run', ModelRun)
