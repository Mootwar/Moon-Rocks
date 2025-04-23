# rockshop-app/Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev     # production deps only

COPY . .

# Environment (overridden by compose)
ENV PORT=3000

EXPOSE 3000
CMD ["node", "server.js"]