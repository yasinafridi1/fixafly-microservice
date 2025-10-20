
FROM node:22.18.0-slim

WORKDIR /gateway

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 4000

CMD ["npm", "start"]



