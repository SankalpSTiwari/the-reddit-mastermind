FROM node:18-alpine

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build production bundle
RUN npm run build

EXPOSE 3000
ENV PORT=3000

# Start Next.js in production mode
CMD ["npm", "run", "start"]

