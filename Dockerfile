FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci
RUN npm install -g nodemon

COPY . .

CMD ["nodemon", "index"]