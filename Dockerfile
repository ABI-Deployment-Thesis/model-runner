# 22.7.0-alpine3.20
FROM node@sha256:ed9736a13b88ba55cbc08c75c9edac8ae7f72840482e40324670b299336680c1

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci
RUN npm install -g nodemon

COPY . .

CMD ["nodemon", "index"]