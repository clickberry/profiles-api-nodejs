# Dockerized Profiles API
Profiles micro-service on Node.js

* [Architecture](#architecture)
* [Technologies](#technologies)
* [Environment Variables](#environment-variables)
* [Events](#events)
* [API](#api)
* [License](#license)

# Architecture
The application is a REST API with database (Redis) and messaging service (Bus) dependencies.

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
TOKEN_ACCESSSECRET | my secret | Access token secret.

# Events
The service generates events to the Bus (messaging service) in response to API requests.

## Send events

Topic | Message | Description
:-- | :-- | :--
profile-updates | { id: *user_id*, name: *user_name*, email: *user_email*, "avatarUrl": *avatar_url* } | Profile updates.

# API

## GET /{id}
Gets profile info.

### Request
| Header   | Value |
|----------|-------------|
| Authorization     | JWT [accessToken] |

### Response
| HTTP       | Value     |
|------------|-----------|
| StatusCode | 200, 403, 404 |
| Body       | { "id": *user_id*, "email": *user_email*, "name": *user_name*, "avatarUrl": *avatar_url*} |

## GET /public/{id}
Gets public profile info.

### Response
| HTTP       | Value     |
|------------|-----------|
| StatusCode | 200, 404 |
| Body       | { "id": *user_id*, "name": *user_name*, "avatarUrl": *avatar_url* } |

## GET /public/list/{ids}
Gets public profiles by ids (comma separated: id1,id2,id3).

### Response
| HTTP       | Value     |
|------------|-----------|
| StatusCode | 200 |
| Body       | [{ "id": *user_id1*, "name": *user_name1*, "avatarUrl": *avatar_url1* }, { "id": *user_id2*, "name": *user_name2*, "avatarUrl": *avatar_url2* }, ...] |

## PUT /{id}
Updates user profile.

### Request
| Header   | Value |
|----------|-------------|
| Authorization     | JWT [accessToken] |


| Body Param    | Description |
|----------|-------------|
| *email    | User email       |
| *name | User name    |

### Response
| HTTP       |  Value                                                             |
|------------|--------------------------------------------------------------------|
| StatusCode | 200, 400, 403, 404, 409                                                 |
| Body       | { "id": *user_id*, "email": *user_email*, "name": *user_name*, "avatarUrl": *avatar_url* } |


# License
Source code is under GNU GPL v3 [license](LICENSE).
