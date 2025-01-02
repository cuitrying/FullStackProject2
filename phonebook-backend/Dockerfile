FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Set environment variables
ENV PORT=3001
# ENV MONGODB_URI=mongodb+srv://fullstack123:<db_password>@cluster0.9t7ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Expose port
EXPOSE 3001

# Start the app
CMD ["node", "index.js"]
