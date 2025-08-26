FROM node:22.18.0-slim

WORKDIR /service/serviceProvider


COPY services/serviceProvider/package*.json ./


RUN npm install --production

COPY services/serviceProvider/ ./

COPY shared ./shared

EXPOSE 4001

CMD ["node", "server.js"]


