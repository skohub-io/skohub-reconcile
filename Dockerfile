FROM node:18.13.0-buster-slim

ENV NODE_ENV production

WORKDIR /app

RUN chown -R node:node /app

COPY --chown=node:node . .

USER node

RUN npm i --only=production

# disable notifier warning
RUN npm config set update-notifier false

CMD ["npm", "run", "start"]