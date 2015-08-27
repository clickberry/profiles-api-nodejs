# Dockerized Profiles API
Profiles micro-service on Node.js

* [Architecture](#architecture)
* [Technologies](#technologies)
* [Environment Variables](#environment-variables)
* [Events](#events)
* [Encryption](#encryption)
* [API](#api)
* [License](#license)

# Architecture
The application consists of two services: 
* REST API service with database and messaging service (Bus) dependencies
* Worker service listening for registration and account-delete messages from the Bus and creates or deletes profiles.

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
NSQLOOKUPD_ADDRESSES | nsqlookupd1:4161,nsqlookupd2:4161 | TCP addresses for nsqlookupd instances to read messages from.
REDIS_ADDRESS | redis.yourdomain.com | Redis server address.
REDIS_PORT | 6379 | Redis server port.

# Events
The service generates events to the Bus (messaging service) in response to API requests.

## Receive events

Topic | Channel | Params | Description
:-- | :-- | :-- | :--
registrations | create-profile | { id: *user_id*, email: *user_email*, memberships: { name: *user_name* } } | Creates user profile.
account-deletes | delete-profile | { id: *user_id* } | Deletes user profile.

## Send events

Topic | Message | Description
:-- | :-- | :--
profile-updates | { id: *user_id*, name: *user_name*, email: *user_email* } | Profile updates.


