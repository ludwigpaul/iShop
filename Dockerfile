# Use the official Node.js runtime as the base image
FROM node:23-alpine

LABEL authors="Ludwig Paul"
LABEL description="Node.js base image for running applications in production"

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Define the command to run the application
CMD ["npm", "start"]
