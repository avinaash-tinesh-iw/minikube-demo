FROM node:lts-alpine

WORKDIR /app

COPY ./dist/apps/study-data-pod .
COPY package.json yarn.lock ./

# e.g. http://<pod name>.<namespace>:<port>
ENV METRIC_POD_ENDPOINT=""

ENV PORT=8081
EXPOSE 8081

RUN npm install --production
# dependencies that express needs
RUN npm install reflect-metadata tslib rxjs express

RUN apk add curl
CMD ["node", "./main.js"]
