# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Prepare the production image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Set default environment file
ARG ENV_FILE=.env.dev.properties
# Copy the environment file into the build context
COPY ./env/${ENV_FILE} .env

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/src/main.js"]
