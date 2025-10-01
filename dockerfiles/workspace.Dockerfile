# Use the official Node.js LTS image
FROM node:20-alpine



WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY . .


# Install dependencies
RUN npm install

# Expose the port Next.js will run on
EXPOSE 3002

# Start the Next.js server
CMD ["sh", "/app/start.sh"]

