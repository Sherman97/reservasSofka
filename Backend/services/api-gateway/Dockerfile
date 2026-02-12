FROM node:20-alpine

WORKDIR /app

# Copy shared database module
COPY services/database services/database

# Install database dependencies if any (we assume they are needed)
WORKDIR /app/services/database
RUN if [ -f package.json ]; then npm install --production; fi

# Copy api-gateway
COPY services/api-gateway services/api-gateway

WORKDIR /app/services/api-gateway
RUN npm ci --only=production

EXPOSE 3000

CMD ["npm", "start"]
