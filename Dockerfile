FROM alpine:latest

LABEL maintainer="sepehr_imanian"

RUN apk add --no-cache bash nodejs npm python3 make g++

COPY . /home

WORKDIR /home/node_cms

RUN npm install

EXPOSE 80

CMD [ "node", "server.js" ]


