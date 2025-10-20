FROM node:22.18.0-slim

WORKDIR /technician

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 4003

CMD ["npm", "start"]


