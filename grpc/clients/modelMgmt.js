const { promisify } = require('util')

const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')

const packageDefinition = protoLoader.loadSync('./grpc/protos/ModelMgmtService.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
const ModelMgmtService = protoDescriptor.ModelMgmtService

const client = new ModelMgmtService(process.env.GRPC_MODEL_MGMT_HOST, grpc.credentials.createInsecure())
const getModelPromisified = promisify(client.GetModel).bind(client)
const getModelsPromisified = promisify(client.GetModels).bind(client)

async function getModelSync(message, token) {
    try {
        res = await getModelPromisified(message, createMetadata(token))
        if (!res.found) throw new Error('Model Not Found')
        return JSON.parse(res.json_data)
    } catch (err) {
        throw err
    }
}

async function getModelsSync(token) {
    try {
        res = await getModelsPromisified({}, createMetadata(token))
        if (!res.models) throw new Error('Unexpected Response')
        return res.models
    } catch (err) {
        throw err
    }
}

function createMetadata(token) {
    const metadata = new grpc.Metadata();
    metadata.add('authorization', token);
    return metadata
}

module.exports = {
    getModelSync,
    getModelsSync
}