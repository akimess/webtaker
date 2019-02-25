let config = require('./config.json');
let envConfig = config["development"];

Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
});