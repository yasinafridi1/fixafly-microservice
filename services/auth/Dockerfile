FROM node:22.18.0-slim

WORKDIR /service/auth


COPY services/auth/package*.json ./


RUN npm install --production

COPY services/auth/ ./

EXPOSE 4004

CMD ["node", "server.js"]


