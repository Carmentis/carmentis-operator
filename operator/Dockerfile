# Use a Node.js LTS base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm i -g @nestjs/cli

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 3000
EXPOSE 3000


# Command to run the application
CMD ["npm", "run", "start"]