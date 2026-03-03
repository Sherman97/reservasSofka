import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { IHttpClient, HttpResponse, RequestConfig } from '../../../core/ports/services/IHttpClient';

interface HttpErrorResponse {
    message: string;
    status?: number;
    data?: unknown;
}

/**
 * AxiosHttpClient - Adapter Pattern implementation
 * Implements IHttpClient interface using axios
 */
export class AxiosHttpClient implements IHttpClient {
    private client: AxiosInstance;

    constructor(baseURL: string, config: AxiosRequestConfig = {}) {
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                ...config.headers
            },
            ...config
        });
    }

    async get(url: string, config: RequestConfig = {}): Promise<HttpResponse> {
        try {
            const response = await this.client.get(url, config);
            return { data: response.data, status: response.status };
        } catch (error) {
            throw this._handleError(error);
        }
    }

    async post(url: string, data?: unknown, config: RequestConfig = {}): Promise<HttpResponse> {
        try {
            const response = await this.client.post(url, data, config);
            return { data: response.data, status: response.status };
        } catch (error) {
            throw this._handleError(error);
        }
    }

    async put(url: string, data?: unknown, config: RequestConfig = {}): Promise<HttpResponse> {
        try {
            const response = await this.client.put(url, data, config);
            return { data: response.data, status: response.status };
        } catch (error) {
            throw this._handleError(error);
        }
    }

    async patch(url: string, data?: unknown, config: RequestConfig = {}): Promise<HttpResponse> {
        try {
            const response = await this.client.patch(url, data, config);
            return { data: response.data, status: response.status };
        } catch (error) {
            throw this._handleError(error);
        }
    }

    async delete(url: string, config: RequestConfig = {}): Promise<HttpResponse> {
        try {
            const response = await this.client.delete(url, config);
            return { data: response.data, status: response.status };
        } catch (error) {
            throw this._handleError(error);
        }
    }

    addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig): void {
        this.client.interceptors.request.use(
            interceptor as unknown as (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig,
            (error) => Promise.reject(error)
        );
    }

    addResponseInterceptor(
        onSuccess: (response: unknown) => unknown,
        onError: (error: unknown) => unknown
    ): void {
        this.client.interceptors.response.use(
            onSuccess as Parameters<typeof this.client.interceptors.response.use>[0],
            onError
        );
    }

    private _handleError(error: unknown): HttpErrorResponse {
        const axiosError = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
        const errorResponse: HttpErrorResponse = {
            message: axiosError.response?.data?.message || axiosError.message || 'Network error occurred',
            status: axiosError.response?.status,
            data: axiosError.response?.data
        };
        console.error('HTTP Error:', errorResponse);
        return errorResponse;
    }
}
