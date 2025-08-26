FROM node:22.18.0-slim

WORKDIR /service/customer


COPY services/customer/package*.json ./


RUN npm install --production

COPY services/customer/ ./

COPY shared ./shared

EXPOSE 4001

CMD ["node", "server.js"]


