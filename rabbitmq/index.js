const path = require('path')

const amqp = require('amqplib')
const mongoose = require('mongoose')

const { getModelByNameSync } = require('../grpc/clients/modelMgmt')
const ModelRun = require('../models/modelRun')
const rabbitmqSender = require('./sender')

const RABBITMQ_PROTOCOL = 'amqp://'
const RABBITMQ_HOST = process.env.RABBITMQ_EXTERNAL_HOST || process.env.RABBITMQ_HOST
const QUEUE_NAME = process.env.RABBITMQ_ML_REQUESTS_QUEUE || 'ml_requests'
// Uses the default user_id defined in the access-control service (https://github.com/ABI-Deployment-Thesis/access-control/blob/v1.0.1/config/mongodb.js#L17)
const DEFAULT_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YzhkMjcxZjViNjhkNjNjNWEyMzJjMSIsImlhdCI6MTcyNDQzNzE1NX0.Jf01_NxF0duJTB8ccsS6SqD5NGpo_APuM3xEulk4ZGg'

async function startConsumer() {
    try {
        const connection = await amqp.connect(`${RABBITMQ_PROTOCOL}${RABBITMQ_HOST}`)
        logger.info('Connected to RabbitMQ')

        const channel = await connection.createChannel()
        logger.info('Channel created')

        // Assert the queue (ensure it exists)
        await channel.assertQueue(QUEUE_NAME, {
            durable: true, // Makes the queue survive broker restarts
        })

        logger.info(`Waiting for messages in queue: ${QUEUE_NAME}`)

        // Consume messages from the queue
        channel.consume(QUEUE_NAME, async (message) => {
            logger.info(`Received raw message: ${message}`)
            if (message !== null) {
                const content = message.content.toString()
                logger.info(`Received message: ${content}`)

                // Parse JSON message
                // Example: {"model":"test_model","req_id":"9a81b539-af43-4f9f-92ef-4459111ccebe","preprocessed_data":{"age":45,"heigth":192,"sex":1}}
                const parsed_msg = JSON.parse(content)
                const model_name = parsed_msg.model
                const transaction_id = parsed_msg.req_id
                const input_features = convertToArray(parsed_msg.preprocessed_data)

                const GRPC_STABLE = process.env.GRPC_STABLE || 'true'
                let model
                if (GRPC_STABLE == 'true') {
                    model = await getModelByNameSync({ name: model_name }, DEFAULT_TOKEN)
                } else {
                    const myHeaders = new Headers()
                    myHeaders.append('Authorization', DEFAULT_TOKEN)
                    const requestOptions = {
                        method: 'GET',
                        headers: myHeaders,
                        redirect: 'follow'
                    }
                    const res = await fetch(`http://${process.env.HTTP_MODEL_MGMT_HOST}/models-by-name/${model_name}`, requestOptions)
                    model = await res.json()
                }

                const run_id = new mongoose.Types.ObjectId()
                const newModelRun = await new ModelRun({
                    _id: run_id,
                    model_id: model._id,
                    rabbitmq_transaction_id: transaction_id,
                    input_features: input_features
                })

                const messageToSend = {
                    run_id: run_id,
                    type: model.type,
                    folder_path: path.dirname(model.file_path),
                    model_filename: path.basename(model.file_path),
                    input_features: JSON.stringify(input_features),
                    mem_limit: model.mem_limit,
                    cpu_percentage: model.cpu_percentage
                }

                await newModelRun.save()
                await rabbitmqSender(process.env.RABBITMQ_DOCKER_ENGINE_QUEUE, messageToSend)

                // Acknowledge the message after processing
                channel.ack(message)
            }
        })
    } catch (err) {
        logger.error(err)
    }
}

// Function to convert the object to the desired array format
function convertToArray(dataObject) {
    return Object.entries(dataObject).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the first letter
        value: value
    }));
}

startConsumer()
