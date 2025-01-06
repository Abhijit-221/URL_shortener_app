# Use the Node.js LTS image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Copy the .env file
COPY .env .env

# Expose the port your app runs on
EXPOSE 8000

# Start the application
CMD ["node", "src/app.js"]
