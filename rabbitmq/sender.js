const amqp = require('amqplib')

module.exports = async function (queue, message) {
    let connection
    try {
        connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`)

        const channel = await connection.createChannel()
        await channel.assertQueue(queue, { durable: true })

        msgToString = JSON.stringify(message)
        channel.sendToQueue(queue, Buffer.from(msgToString))
        logger.debug(`RabbitMQ message sent: ${msgToString}`)

        await channel.close()
    } catch (err) {
        throw err
    } finally {
        if (connection) await connection.close()
    }
}