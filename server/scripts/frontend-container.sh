#!/usr/bin/env bash

set -Eeou pipefail

container_name="bnj2-frontend-dev"

# Remove the dev frontend container if it already exists
if docker container inspect "${container_name}" > /dev/null 2>&1 ; then
    docker rm -f "${container_name}"
fi

# Run the dev frontend container and mount the client folder to it
# If change is made in the client code, it will be rebuilt and restarted inside the container
docker run --name "${container_name}" --rm -d -it -w "/app" -v ${PWD%/*}/client:/app -p 8080:8080 node:latest /bin/bash -c 'npm ci; VITE_WS_HOST="localhost:9090" ./node_modules/vite/bin/vite.js --host'
