# Use the official Node.js LTS image
FROM node:20-alpine



# define the environment variables
ARG NEXT_PUBLIC_WORKSPACE_API_BASE_URL

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY . .


# Install dependencies
RUN npm install

# Build the Next.js app
RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]

