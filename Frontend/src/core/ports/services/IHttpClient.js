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
    async get(_url, _config) {
        throw new Error('Method not implemented: get');
    }

    /**
     * Perform POST request
     * @param {string} url - Endpoint URL
     * @param {any} data - Request body
     * @param {object} config - Request configuration
     * @returns {Promise<{data: any, status: number}>}
     */
    async post(_url, _data, _config) {
        throw new Error('Method not implemented: post');
    }

    /**
     * Perform PUT request
     * @param {string} url - Endpoint URL
     * @param {any} data - Request body
     * @param {object} config - Request configuration
     * @returns {Promise<{data: any, status: number}>}
     */
    async put(_url, _data, _config) {
        throw new Error('Method not implemented: put');
    }

    /**
     * Perform DELETE request
     * @param {string} url - Endpoint URL
     * @param {object} config - Request configuration
     * @returns {Promise<{data: any, status: number}>}
     */
    async delete(_url, _config) {
        throw new Error('Method not implemented: delete');
    }

    /**
     * Add request interceptor
     * @param {Function} interceptor - Function to modify request before sending
     */
    addRequestInterceptor(_interceptor) {
        throw new Error('Method not implemented: addRequestInterceptor');
    }

    /**
     * Add response interceptor
     * @param {Function} onSuccess - Function to handle successful response
     * @param {Function} onError - Function to handle error response
     */
    addResponseInterceptor(_onSuccess, _onError) {
        throw new Error('Method not implemented: addResponseInterceptor');
    }
}
