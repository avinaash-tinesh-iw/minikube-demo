FROM node:lts-alpine

WORKDIR /app

COPY ./dist/apps/metrics-data-pod .
COPY package.json yarn.lock ./

# e.g. http://<pod name>.<namespace>:<port>
ENV STUDY_POD_ENDPOINT=""

ENV PORT=8080
EXPOSE 8080

RUN npm install --production
# dependencies that express needs
RUN npm install reflect-metadata tslib rxjs express
RUN apk add curl
CMD ["node", "./main.js"]
