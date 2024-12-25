# Use a specific Node.js version for consistency
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm packages
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port that the server will listen on
EXPOSE 3000

# Start the Vite development server
CMD ["npm", "start"]