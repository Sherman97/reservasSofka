# --- Stage 1: Build Frontend ---
FROM node:18-alpine AS frontend-builder
WORKDIR /app/Frontend
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ ./
RUN npm run build

# --- Stage 2: Final Image ---
FROM node:18-alpine
WORKDIR /app

# Install pm2 and serve
RUN npm install -g pm2 serve

# Copy Backend services
COPY Backend/ ./Backend/

# Install dependencies for each service
# Note: This is simplified for a monolithic image. 
# We run npm install in each service directory.
RUN cd Backend/services/api-gateway && npm install --production
RUN cd Backend/services/auth-service && npm install --production
RUN cd Backend/services/bookings-service && npm install --production
RUN cd Backend/services/inventory-service && npm install --production
RUN cd Backend/services/locations-service && npm install --production

# Copy Frontend build from Stage 1
COPY --from=frontend-builder /app/Frontend/dist ./Frontend/dist

# Copy PM2 config
COPY ecosystem.config.js ./

# Expose ports
# Gateway: 3000
# Auth: 3001
# Bookings: 3002
# Inventory: 3003
# Locations: 3004
# Frontend (via serve): 8080
EXPOSE 3000 3001 3002 3003 3004 8080

# Environment variables for production
ENV NODE_ENV=production

# Start all services with PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
