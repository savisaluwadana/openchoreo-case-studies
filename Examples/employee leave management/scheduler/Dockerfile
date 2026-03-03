FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY src/ ./src/

CMD ["node", "src/index.js"]
