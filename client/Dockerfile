FROM node:alpine AS builder
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install && npm run build

FROM flashspys/nginx-static
RUN apk update && apk upgrade
COPY --from=builder /usr/src/app/dist /static
COPY --from=builder /usr/src/app/assets /static/assets
COPY --from=builder /usr/src/app/sprites /static/sprites
COPY --from=builder /usr/src/app/src /static/src
