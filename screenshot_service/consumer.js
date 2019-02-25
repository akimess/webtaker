const amqp = require('amqplib');
const bluebird = require('bluebird')
const takeScreenshot = require('./functions');

const assertQueueOptions = { durable: true };
const consumeQueueOptions = { noAck: false };

const assertAndConsumeQueue = (channel, workQueue) => {

    const ackMsg = (msg) => bluebird.resolve(msg)
        .tap(msg => takeScreenshot(msg))
        .then((msg) => channel.ack(msg))
        .catch((e) => channel.nack(msg, false, false));
    
    return channel.assertQueue(workQueue, assertQueueOptions)
        .then(() => channel.prefetch(1))
        .then(() => channel.consume(workQueue, ackMsg, consumeQueueOptions));
}

const listenToQueue = (workQueue) => amqp.connect("amqp://rabbitmq")
    .then(connection => connection.createChannel())
    .then(channel => assertAndConsumeQueue(channel, workQueue));

module.exports = listenToQueue;