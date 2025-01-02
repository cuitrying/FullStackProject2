FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# The port your app runs on
EXPOSE 3001

# Start the application
CMD ["node", "index.js"] 