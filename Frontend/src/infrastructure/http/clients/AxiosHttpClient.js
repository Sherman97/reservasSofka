import axios from 'axios';
import { IHttpClient } from '../../../core/ports/services/IHttpClient';

/**
 * AxiosHttpClient - Adapter Pattern implementation
 * Adapts axios library to our IHttpClient interface
 * This allows us to easily switch HTTP libraries in the future
 */
export class AxiosHttpClient extends IHttpClient {
    constructor(baseURL, config = {}) {
        super();
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                ...config.headers
            },
            ...config
        });
    }

    async get(url, config = {}) {
        try {
            const response = await this.client.get(url, config);
            return {
                data: response.data,
                status: response.status
            };
        } catch (error) {
            throw this._handleError(error);
        }
    }

    async post(url, data, config = {}) {
        try {
            const response = await this.client.post(url, data, config);
            return {
                data: response.data,
                status: response.status
            };
        } catch (error) {
            throw this._handleError(error);
        }
    }

    async put(url, data, config = {}) {
        try {
            const response = await this.client.put(url, data, config);
            return {
                data: response.data,
                status: response.status
            };
        } catch (error) {
            throw this._handleError(error);
        }
    }

    async delete(url, config = {}) {
        try {
            const response = await this.client.delete(url, config);
            return {
                data: response.data,
                status: response.status
            };
        } catch (error) {
            throw this._handleError(error);
        }
    }

    addRequestInterceptor(interceptor) {
        this.client.interceptors.request.use(interceptor, (error) => Promise.reject(error));
    }

    addResponseInterceptor(onSuccess, onError) {
        this.client.interceptors.response.use(onSuccess, onError);
    }

    /**
     * Centralized error handling
     * @private
     */
    _handleError(error) {
        const errorResponse = {
            message: error.response?.data?.message || error.message || 'Network error occurred',
            status: error.response?.status,
            data: error.response?.data
        };

        // Log error for debugging (can be replaced with proper logging service)
        console.error('HTTP Error:', errorResponse);

        return errorResponse;
    }
}
