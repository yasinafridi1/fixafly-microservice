FROM node:22.18.0-slim

WORKDIR /service/technician


COPY services/technician/package*.json ./


RUN npm install --production

COPY services/technician/ ./

COPY shared ./shared

EXPOSE 4001

CMD ["node", "server.js"]


