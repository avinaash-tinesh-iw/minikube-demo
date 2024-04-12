FROM node:lts-alpine

WORKDIR /app

COPY ./dist/apps/study-data-pod .
COPY package.json yarn.lock ./

EXPOSE 8081

RUN npm install --production
# dependencies that express needs
RUN npm install reflect-metadata tslib rxjs express
CMD node ./main.js
