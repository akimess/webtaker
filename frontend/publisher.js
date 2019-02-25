const amqp = require('amqplib');

const assertQueueOptions = { durable: true };
const sendToQueueOptions = { persistent: true };

const assertAndSendToQueue = (channel, workQueue, data) => {
    const bufferedData = Buffer.from(data);
    return channel.assertQueue(workQueue, assertQueueOptions)
        .then(() => channel.sendToQueue(workQueue, bufferedData, sendToQueueOptions))
        .then(() => channel.close());
}

const sendTask = (workQueue, data) => amqp.connect("amqp://rabbitmq")
    .then(connection => connection.createChannel())
    .then(channel => assertAndSendToQueue(channel, workQueue, data));

module.exports = sendTask;