# Dockerized Profiles API
Profiles micro-service on Node.js

* [Architecture](#architecture)
* [Technologies](#technologies)
* [Environment Variables](#environment-variables)
* [Events](#events)
* [API](#api)
* [License](#license)

# Architecture
The application is a REST API with database and messaging service (Bus) dependencies.

# Technologies
* Node.js
* Redis/node_redis+hiredis
* Express.js
* Official nsqjs driver for NSQ messaging service

# Environment Variables
The service should be properly configured with following environment variables.

Key | Value | Description
:-- | :-- | :-- 
NSQD_ADDRESS | bus.yourdomain.com | A hostname or an IP address of the NSQD running instance to publush messages to.
NSQD_PORT | 4150 | A TCP port number of the NSQD running instance to publish messages to.
REDIS_ADDRESS | redis.yourdomain.com | Redis server address.
REDIS_PORT | 6379 | Redis server port.

# Events
The service generates events to the Bus (messaging service) in response to API requests.

## Send events

Topic | Message | Description
:-- | :-- | :--
profile-updates | { id: *user_id*, name: *user_name*, email: *user_email* } | Profile updates.

# API

# License
Source code is under GNU GPL v3 [license](LICENSE).
