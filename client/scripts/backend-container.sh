#!/usr/bin/env bash

set -Eeou pipefail

container_name="bnj2-backend-dev"

# Remove the dev backend container if it already exists
if docker container inspect "${container_name}" > /dev/null 2>&1 ; then
    docker rm -f "${container_name}"
fi

# Run the dev backend container and mount the server folder to it
# If change is made in the server code, it will be rebuilt and restarted inside the container
docker run --name "${container_name}" -it --rm -d -w "/app" -v ${PWD%/*}/server:/app -p 9090:9090 cosmtrek/air
