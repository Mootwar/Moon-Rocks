# Dockerfile for Node.js backend with static frontend serving
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY . .

# Serve static files from public directory
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]