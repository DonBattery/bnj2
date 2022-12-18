# bnj2

Bump'n'Junk 2 is a shitty clone of [Jump'n'Bump](https://en.wikipedia.org/wiki/Jump_%27n_Bump)

## Run the application locally

Use `docker compose up` to spin up the local environment. Access the webpage at http://localhost:8080

## Development

### Server

From the **server** folder execute the `./scripts/frontend-container.sh` command. This start a container in the background with the client code in it, running on Vite, so if you modify the frontend code in the **client** folder, the webpage will be re-loaded with the changes.

### Client

From the **client** folder execute the `npm run dev` command. This will start a Docker container in the background with the server code running inside (if the server code is modified, it will re-built and re-started inside the container). Then it starts the React project with Vite.

## Environments

### Staging

http://ec2-3-122-127-183.eu-central-1.compute.amazonaws.com/
