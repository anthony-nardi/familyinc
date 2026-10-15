FROM node:22-alpine

RUN corepack enable

RUN mkdir -p /home
WORKDIR /home

COPY ./package.json ./yarn.lock ./.yarnrc.yml ./
COPY ./.yarn/releases ./.yarn/releases
COPY ./workspaces/client ./workspaces/client
COPY ./workspaces/shared ./workspaces/shared

RUN yarn install

CMD ["yarn", "start:prod:client"]
