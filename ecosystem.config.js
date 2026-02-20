module.exports = {
    apps: [
        {
            name: 'api-gateway',
            script: './Backend/services/api-gateway/src/server.js',
            env: {
                PORT: 3000,
                AUTH_URL: 'http://localhost:3001',
                BOOKINGS_URL: 'http://localhost:3002',
                INVENTORY_URL: 'http://localhost:3003',
                LOCATIONS_URL: 'http://localhost:3004',
                DB_HOST: process.env.DB_HOST || 'localhost',
                DB_USER: process.env.DB_USER || 'root',
                DB_PASSWORD: process.env.DB_PASSWORD || '7801996',
                DB_NAME: process.env.DB_NAME || 'app_db',
                NODE_ENV: 'production'
            }
        },
        {
            name: 'auth-service',
            script: './Backend/services/auth-service/src/server.js',
            env: {
                PORT: 3001,
                DB_HOST: process.env.DB_HOST || 'localhost',
                DB_USER: process.env.DB_USER || 'root',
                DB_PASSWORD: process.env.DB_PASSWORD || '7801996',
                DB_NAME: process.env.DB_NAME || 'app_db',
                JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
                NODE_ENV: 'production'
            }
        },
        {
            name: 'bookings-service',
            script: './Backend/services/bookings-service/src/server.js',
            env: {
                PORT: 3002,
                DB_HOST: process.env.DB_HOST || 'localhost',
                DB_USER: process.env.DB_USER || 'root',
                DB_PASSWORD: process.env.DB_PASSWORD || '7801996',
                DB_NAME: process.env.DB_NAME || 'app_db',
                JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
                NODE_ENV: 'production'
            }
        },
        {
            name: 'inventory-service',
            script: './Backend/services/inventory-service/src/server.js',
            env: {
                PORT: 3003,
                DB_HOST: process.env.DB_HOST || 'localhost',
                DB_USER: process.env.DB_USER || 'root',
                DB_PASSWORD: process.env.DB_PASSWORD || '7801996',
                DB_NAME: process.env.DB_NAME || 'app_db',
                JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
                NODE_ENV: 'production'
            }
        },
        {
            name: 'locations-service',
            script: './Backend/services/locations-service/src/server.js',
            env: {
                PORT: 3004,
                DB_HOST: process.env.DB_HOST || 'localhost',
                DB_USER: process.env.DB_USER || 'root',
                DB_PASSWORD: process.env.DB_PASSWORD || '7801996',
                DB_NAME: process.env.DB_NAME || 'app_db',
                NODE_ENV: 'production'
            }
        },
        {
            name: 'frontend-server',
            script: 'serve',
            env: {
                PM2_SERVE_PATH: './Frontend/dist',
                PM2_SERVE_PORT: 8080,
                PM2_SERVE_SPA: 'true',
                NODE_ENV: 'production'
            }
        }
    ]
};
