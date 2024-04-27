FROM node:lts AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm install

# Install dependencies
RUN npm install
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the AdonisJS application
RUN node ace build --production --ignore-ts-errors

FROM node:lts AS production
# Set working directory
WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app/build ./

RUN npm install
RUN npm ci --production

# Expose port 3333 (default AdonisJS port)
EXPOSE 3333

# Start the AdonisJS application
CMD [ "npm", "start" ]
