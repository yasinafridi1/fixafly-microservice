FROM node:22.18.0-slim

WORKDIR /auth

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 4004

CMD ["npm", "start"]


