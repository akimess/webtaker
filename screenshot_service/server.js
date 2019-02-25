const express = require('express');
const listenToQueue = require('./consumer');
require('./config/config');

let port = process.env.PORT || 4000;

let app = express();

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
    setTimeout(() => listenToQueue('screenshots'), 10000)
});
