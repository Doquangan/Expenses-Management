FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other source code to the working directory
COPY . .

# Expose port running the application
EXPOSE 3000

# Start the application in dev mode for development (or production if needed)
CMD ["npm", "run", "dev"]
