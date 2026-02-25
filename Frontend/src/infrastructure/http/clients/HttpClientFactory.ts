import { AxiosHttpClient } from './AxiosHttpClient';
import type { IHttpClient, RequestConfig } from '../../../core/ports/services/IHttpClient';
import type { IStorageService } from '../../../core/ports/services/IStorageService';

interface CreateClientOptions {
    baseURL: string;
    requiresAuth?: boolean;
    storageService?: IStorageService | null;
    headers?: Record<string, string>;
}

export class HttpClientFactory {
    static create({ baseURL, requiresAuth = false, storageService = null, headers = {} }: CreateClientOptions): IHttpClient {
        const client = new AxiosHttpClient(baseURL, { headers });

        if (requiresAuth && storageService) {
            client.addRequestInterceptor((config: RequestConfig) => {
                const token = storageService.get('token');
                if (token) {
                    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
                }
                return config;
            });
        }

        client.addResponseInterceptor(
            (response: unknown) => response,
            (error: unknown) => {
                const axiosError = error as { response?: { status?: number } };
                if (axiosError.response) {
                    const status = axiosError.response.status;
                    if (status === 401) {
                        console.warn('Unauthorized request - token may be invalid');
                    } else if (status === 403) {
                        console.warn('Forbidden - insufficient permissions');
                    } else if (status && status >= 500) {
                        console.error('Server error occurred');
                    }
                }
                return Promise.reject(error);
            }
        );

        return client;
    }

    static createAuthClient(storageService: IStorageService): IHttpClient {
        const baseURL = import.meta.env.VITE_API_URL;
        console.log('API Base URL:', baseURL);
        return this.create({ baseURL, requiresAuth: true, storageService });
    }

    static createBookingsClient(storageService: IStorageService): IHttpClient {
        const baseURL = import.meta.env.VITE_BOOKINGS_URL;
        return this.create({ baseURL, requiresAuth: true, storageService });
    }

    static createInventoryClient(storageService: IStorageService): IHttpClient {
        const baseURL = import.meta.env.VITE_INVENTORY_URL || import.meta.env.VITE_API_URL;
        return this.create({ baseURL, requiresAuth: true, storageService });
    }

    static createLocationsClient(storageService: IStorageService): IHttpClient {
        const baseURL = import.meta.env.VITE_LOCATIONS_URL || import.meta.env.VITE_API_URL;
        return this.create({ baseURL, requiresAuth: true, storageService });
    }
}
