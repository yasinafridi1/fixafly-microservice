
FROM node:22.18.0-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]



