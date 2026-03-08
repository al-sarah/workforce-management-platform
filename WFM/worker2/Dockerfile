# syntax=docker/dockerfile:1

FROM node:22-alpine
WORKDIR /app

COPY worker2/package*.json ./
RUN npm ci

COPY worker2/ ./

CMD ["npm", "start"]
