const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const {retrieveImages, sendScreenshotTask} = require('./controllers');;
const Redis = require('ioredis');

require('./config/config');

//Connect to redis docker container
const redis = new Redis('6379', 'redis');

//Handle request caching
const redisMiddleware = (req, res, next) => {
    const key = req.originalUrl || req.url;
    redis.get(key, (err, reply) => {
        if (reply) {
            res.send(reply);
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                redis.set(key, JSON.stringify(body));
                res.sendResponse(body);
            }
            next();
        }
    })
}

let port = process.env.PORT || 4000;

let app = express();
app.use(bodyParser());

//Web page
app.get('/', async function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

//Send screenshot task to service
app.post('/', sendScreenshotTask);

//Retrieve images
app.get('/:id', redisMiddleware, retrieveImages);

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

