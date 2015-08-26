var redis = require('redis');
var db = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_ADDRESS);

