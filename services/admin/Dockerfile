FROM node:22.18.0-slim

WORKDIR /admin

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4001

CMD ["npm", "start"]
