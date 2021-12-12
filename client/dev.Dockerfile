FROM node:latest

WORKDIR /app

COPY . .

RUN npm i

CMD [ "npm", "run", "dev", "--", "--host", "0.0.0.0" ]
