# Base image for node.js
FROM node:20-slim AS base

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json first to leverage docker caching.
COPY package*.json ./

FROM base AS production-build-stage
ENV NODE_ENV=production
RUN npm install --only=production

# Copy the application Code.
COPY . .

# Expose the application port
EXPOSE 3000

# Command to run the application in production
CMD ["npm", "run", "deploy:dev"]

# Install development dependencies
FROM base AS development-build-stage
ENV NODE_ENV=development
RUN npm install

# Copy the application code.
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

