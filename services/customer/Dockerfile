FROM node:22.18.0-slim

WORKDIR /customer

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 4002

CMD ["npm", "start"]


