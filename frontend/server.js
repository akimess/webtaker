const express = require('express');
const bodyParser = require('body-parser');
const sendTask = require('./publisher');
const crypto = require('crypto');
const path = require('path');
const {createUrls, isURL} = require('./functions');
const Redis = require('ioredis');
const aws = require('aws-sdk');
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

//Amazon S3 Storage credentials init
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_BUCKET_REGION
});

let port = process.env.PORT || 4000;

let app = express();
app.use(bodyParser());

//Web page
app.get('/', async function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

//Send screenshot task to service
app.post('/', function (req, res) {
    const list = req.body;
    
    if(list.length > 0){

        //Check if valid URL
        for(let i = 0; i < list.length; i++){
            if(!isURL(list[i])){
                res.status(400).send({error: true, message: 'One of the URLs is not valid'});
                return;
            }
        }

        const msg = {
            id: crypto.randomBytes(16).toString('hex'),
            list: list
        };

        const stringMsg = JSON.stringify(msg);
    
        try {
            sendTask("screenshots", stringMsg);
            const urls = createUrls(msg.id, list);
            res.status(200).send({id: msg.id, urls: urls});
        } catch (e) {
            res.status(500).send();
        }
    } else {
        res.status(400).send({error: true, message: "No URLs added"});
    }

});

//Retrieve images
app.get('/:id', redisMiddleware, async function (req, res) {
    const s3 = new aws.S3();
    const id = req.params.id;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: id
    };

    s3.listObjectsV2(params, (err, data) => {
        if (err) res.status(500).send();
        else {
            if (data.Contents.length > 0) {
                let result = [];
                for (let i = 0; i < data.Contents.length; i++) {
                    const key = data.Contents[i].Key;
                    const hostname = key.split('/')[1].slice(0, -4);
                    result.push({
                        hostname: hostname,
                        url: `https://s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${key}`
                    });
                }
                res.status(200).send(result);
            } else {
                res.status(400).send({error: true, message: "No images found for that session ID"});
            }

        }

    });
});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

