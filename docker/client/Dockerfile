FROM node:16.13.0-alpine

RUN mkdir -p /home
WORKDIR /home

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./workspaces/client ./workspaces/client
COPY ./workspaces/shared ./workspaces/shared

RUN yarn install

CMD ["yarn", "start:prod:client"]
