FROM golang:latest

WORKDIR /app

COPY . .

RUN go get github.com/githubnemo/CompileDaemon

RUN go mod download

ENTRYPOINT CompileDaemon --build="go build -o backend ." --command="./backend"
