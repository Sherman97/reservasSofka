/**
 * IHttpClient - Interface for HTTP communication
 * All HTTP implementations must extend this interface
 * This enables dependency inversion and easy testing
 */
export class IHttpClient {
    /**
     * Perform GET request
     * @param {string} url - Endpoint URL
     * @param {object} config - Request configuration
     * @returns {Promise<{data: any, status: number}>}
     */
    async get(url, config) {
        throw new Error('Method not implemented: get');
    }

    /**
     * Perform POST request
     * @param {string} url - Endpoint URL
     * @param {any} data - Request body
     * @param {object} config - Request configuration
     * @returns {Promise<{data: any, status: number}>}
     */
    async post(url, data, config) {
        throw new Error('Method not implemented: post');
    }

    /**
     * Perform PUT request
     * @param {string} url - Endpoint URL
     * @param {any} data - Request body
     * @param {object} config - Request configuration
     * @returns {Promise<{data: any, status: number}>}
     */
    async put(url, data, config) {
        throw new Error('Method not implemented: put');
    }

    /**
     * Perform DELETE request
     * @param {string} url - Endpoint URL
     * @param {object} config - Request configuration
     * @returns {Promise<{data: any, status: number}>}
     */
    async delete(url, config) {
        throw new Error('Method not implemented: delete');
    }

    /**
     * Add request interceptor
     * @param {Function} interceptor - Function to modify request before sending
     */
    addRequestInterceptor(interceptor) {
        throw new Error('Method not implemented: addRequestInterceptor');
    }

    /**
     * Add response interceptor
     * @param {Function} onSuccess - Function to handle successful response
     * @param {Function} onError - Function to handle error response
     */
    addResponseInterceptor(onSuccess, onError) {
        throw new Error('Method not implemented: addResponseInterceptor');
    }
}
