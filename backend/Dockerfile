# Use a specific Node.js version for consistency
FROM node:20.13.1

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm packages
RUN npm install 

# Copy the rest of the application code to the container
COPY . .

# Set environment variable
ENV NODE_ENV=development

# Expose the port that the server will listen on
EXPOSE 4000

# Start the backend server
CMD ["npm", "start"]
