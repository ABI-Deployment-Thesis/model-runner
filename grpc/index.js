const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')

const runnerController = require('./controllers/runner.controller')

const packageDefinition = protoLoader.loadSync('./grpc/protos/ModelRunnerService.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
const ModelRunnerService = protoDescriptor.ModelRunnerService

const server = new grpc.Server()
server.addService(ModelRunnerService.service, { UpdateRunninState: runnerController.UpdateRunninState })

const port = `0.0.0.0:${process.env.GRPC_PORT}`
server.bindAsync(port, grpc.ServerCredentials.createInsecure(), () => {
    logger.info(`gRPC server hosted on port ${port}`)
})
