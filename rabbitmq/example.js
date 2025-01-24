const amqp = require('amqplib')

const RABBITMQ_PROTOCOL = 'amqp://'
const RABBITMQ_HOST = '127.0.0.1'
const QUEUE_NAME = 'ml_requests'

// Based on the diabetes predictive model (https://github.com/ABI-Deployment-Thesis/healthcare-models/tree/main/predictive/diabetes)
const exampleMessage = {
    model: 'diabetes_decision_tree_py.sav',
    req_id: 'f9c37be8-bcf9-439a-84cf-42c1c62ba6e4',
    preprocessed_data: {
        "Pregnancies":4,
        "Glucose":137,
        "BloodPressure":84,
        "SkinThickness":0,
        "Insulin":0.0,
        "BMI":31.2,
        "DiabetesPedigreeFunction":0.252,
        "Age":30,
    }
}

rabbitmqSender(QUEUE_NAME, exampleMessage)

async function rabbitmqSender(queue, exampleMessage) {
    let connection
    try {
        connection = await amqp.connect(`${RABBITMQ_PROTOCOL}${RABBITMQ_HOST}`)

        const channel = await connection.createChannel()
        await channel.assertQueue(queue, { durable: true })

        msgToString = JSON.stringify(exampleMessage)
        channel.sendToQueue(queue, Buffer.from(msgToString))
        console.log(`RabbitMQ message sent: ${msgToString}`)

        await channel.close()
    } catch (err) {
        throw err
    } finally {
        if (connection) await connection.close()
    }
}