import { AxiosHttpClient } from './AxiosHttpClient';

/**
 * HttpClientFactory - Factory Pattern implementation
 * Creates HTTP client instances with specific configurations
 * Encapsulates complex creation logic and provides convenient methods
 */
export class HttpClientFactory {
    /**
     * Create a generic HTTP client with custom configuration
     * @param {object} config - Configuration object
     * @param {string} config.baseURL - Base URL for the API
     * @param {boolean} config.requiresAuth - Whether to add auth interceptor
     * @param {IStorageService} config.storageService - Storage service for token retrieval
     * @param {object} config.headers - Additional headers
     * @returns {AxiosHttpClient}
     */
    static create({ baseURL, requiresAuth = false, storageService = null, headers = {} }) {
        const client = new AxiosHttpClient(baseURL, { headers });

        if (requiresAuth && storageService) {
            // Add authorization interceptor
            client.addRequestInterceptor((config) => {
                const token = storageService.get('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            });
        }

        // Add response error interceptor for common error handling
        client.addResponseInterceptor(
            (response) => response, // Pass through successful responses
            (error) => {
                // Handle common errors (401, 403, etc.)
                if (error.response) {
                    const status = error.response.status;

                    if (status === 401) {
                        // Unauthorized - could trigger logout or token refresh
                        console.warn('Unauthorized request - token may be invalid');
                        // Could emit event here for global error handling
                    } else if (status === 403) {
                        console.warn('Forbidden - insufficient permissions');
                    } else if (status >= 500) {
                        console.error('Server error occurred');
                    }
                }

                return Promise.reject(error);
            }
        );

        return client;
    }

    /**
     * Create HTTP client for main API/Auth service
     * @param {IStorageService} storageService - Storage service instance
     * @returns {AxiosHttpClient}
     */
    static createAuthClient(storageService) {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        console.log('API Base URL:', baseURL);
        return this.create({
            baseURL,
            requiresAuth: true,
            storageService
        });
    }

    /**
     * Create HTTP client for Bookings service
     * @param {IStorageService} storageService - Storage service instance
     * @returns {AxiosHttpClient}
     */
    static createBookingsClient(storageService) {
        const baseURL = import.meta.env.VITE_BOOKINGS_URL || 'http://localhost:3000';
        return this.create({
            baseURL,
            requiresAuth: true,
            storageService
        });
    }

    /**
     * Create HTTP client for Inventory service
     * @param {IStorageService} storageService - Storage service instance
     * @returns {AxiosHttpClient}
     */
    static createInventoryClient(storageService) {
        const baseURL = import.meta.env.VITE_INVENTORY_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
        return this.create({
            baseURL,
            requiresAuth: true,
            storageService
        });
    }

    /**
     * Create HTTP client for Locations service
     * @param {IStorageService} storageService - Storage service instance
     * @returns {AxiosHttpClient}
     */
    static createLocationsClient(storageService) {
        const baseURL = import.meta.env.VITE_LOCATIONS_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
        return this.create({
            baseURL,
            requiresAuth: true,
            storageService
        });
    }
}
