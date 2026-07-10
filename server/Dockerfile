FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY src ./src

# Set environment
ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/server.js"]
