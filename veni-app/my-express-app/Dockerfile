FROM node:18
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build
ENV PORT=8000
EXPOSE ${PORT}
CMD ["yarn","dev"]
