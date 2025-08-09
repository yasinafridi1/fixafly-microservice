FROM node:22.18.0-slim

WORKDIR /service/admin


COPY services/admin/package*.json ./


RUN npm install --production

COPY services/admin/ ./

COPY shared ./shared

EXPOSE 4001

CMD ["node", "server.js"]


