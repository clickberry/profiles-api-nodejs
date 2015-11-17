#!/bin/bash
set -e

# set env variables
if [ -n "$REDIS_PORT_6379_TCP_ADDR" ] && [ -n "$REDIS_PORT_6379_TCP_PORT" ]; then
  export REDIS_ADDRESS="${REDIS_PORT_6379_TCP_ADDR}"
  export REDIS_PORT="${REDIS_PORT_6379_TCP_PORT}"
fi
echo "USING REDIS: ${REDIS_PORT_6379_TCP_ADDR}:${REDIS_PORT_6379_TCP_PORT}"

if [ -n "$NSQD_PORT_4150_TCP_ADDR" ] && [ -n "$NSQD_PORT_4150_TCP_PORT" ]; then
  export NSQD_ADDRESS="${NSQD_PORT_4150_TCP_ADDR}"
  export NSQD_PORT="${NSQD_PORT_4150_TCP_PORT}"
fi
echo "USING NSQD: ${NSQD_PORT_4150_TCP_ADDR}:${NSQD_PORT}"

# execute nodejs application
exec npm start