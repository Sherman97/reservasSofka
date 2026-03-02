import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClientFactory } from './HttpClientFactory';

// Track calls per-instance using a captured array
let lastCreatedInstance: any = null;

vi.mock('./AxiosHttpClient', () => ({
    AxiosHttpClient: class MockAxiosHttpClient {
        get = vi.fn();
        post = vi.fn();
        put = vi.fn();
        patch = vi.fn();
        delete = vi.fn();
        addRequestInterceptor = vi.fn();
        addResponseInterceptor = vi.fn();

        constructor(public baseURL: string, public options?: any) {
            lastCreatedInstance = this;
        }
    }
}));

// Mock import.meta.env
vi.stubEnv('VITE_API_URL', 'http://localhost:8080');
vi.stubEnv('VITE_BOOKINGS_URL', 'http://localhost:8081');
vi.stubEnv('VITE_INVENTORY_URL', 'http://localhost:8082');
vi.stubEnv('VITE_LOCATIONS_URL', 'http://localhost:8083');

describe('HttpClientFactory', () => {
    const mockStorageService = {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
        has: vi.fn(),
        getJSON: vi.fn(),
        setJSON: vi.fn()
    };

    beforeEach(() => {
        lastCreatedInstance = null;
        mockStorageService.get.mockReset();
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => { vi.restoreAllMocks(); });

    it('create debe crear un cliente HTTP básico', () => {
        const client = HttpClientFactory.create({ baseURL: 'http://test.com' });
        expect(client).toBeDefined();
        expect(lastCreatedInstance.addResponseInterceptor).toHaveBeenCalled();
    });

    it('create con requiresAuth debe agregar interceptor de auth', () => {
        mockStorageService.get.mockReturnValue('test-token');

        HttpClientFactory.create({
            baseURL: 'http://test.com',
            requiresAuth: true,
            storageService: mockStorageService
        });

        expect(lastCreatedInstance.addRequestInterceptor).toHaveBeenCalled();

        // Execute the interceptor to verify it adds auth header
        const interceptor = lastCreatedInstance.addRequestInterceptor.mock.calls[0][0];
        const config = interceptor({ headers: {} });
        expect(config.headers.Authorization).toBe('Bearer test-token');
    });

    it('interceptor de auth no agrega header sin token', () => {
        mockStorageService.get.mockReturnValue(null);

        HttpClientFactory.create({
            baseURL: 'http://test.com',
            requiresAuth: true,
            storageService: mockStorageService
        });

        const interceptor = lastCreatedInstance.addRequestInterceptor.mock.calls[0][0];
        const config = interceptor({ headers: {} });
        expect(config.headers.Authorization).toBeUndefined();
    });

    it('response interceptor maneja error 401', async () => {
        HttpClientFactory.create({ baseURL: 'http://test.com' });

        const onError = lastCreatedInstance.addResponseInterceptor.mock.calls[0][1];
        const error = { response: { status: 401 } };

        await expect(onError(error)).rejects.toEqual(error);
    });

    it('response interceptor maneja error 403', async () => {
        HttpClientFactory.create({ baseURL: 'http://test.com' });

        const onError = lastCreatedInstance.addResponseInterceptor.mock.calls[0][1];
        const error = { response: { status: 403 } };

        await expect(onError(error)).rejects.toEqual(error);
    });

    it('response interceptor maneja error 500+', async () => {
        HttpClientFactory.create({ baseURL: 'http://test.com' });

        const onError = lastCreatedInstance.addResponseInterceptor.mock.calls[0][1];
        const error = { response: { status: 500 } };

        await expect(onError(error)).rejects.toEqual(error);
    });

    it('response interceptor pasa respuesta exitosa', () => {
        HttpClientFactory.create({ baseURL: 'http://test.com' });

        const onSuccess = lastCreatedInstance.addResponseInterceptor.mock.calls[0][0];
        const response = { data: 'ok' };
        expect(onSuccess(response)).toEqual(response);
    });

    it('createAuthClient debe crear cliente con VITE_API_URL', () => {
        const client = HttpClientFactory.createAuthClient(mockStorageService);
        expect(client).toBeDefined();
        expect(lastCreatedInstance.addRequestInterceptor).toHaveBeenCalled();
    });

    it('createBookingsClient debe crear cliente con VITE_BOOKINGS_URL', () => {
        const client = HttpClientFactory.createBookingsClient(mockStorageService);
        expect(client).toBeDefined();
    });

    it('createInventoryClient debe crear cliente', () => {
        const client = HttpClientFactory.createInventoryClient(mockStorageService);
        expect(client).toBeDefined();
    });

    it('createLocationsClient debe crear cliente', () => {
        const client = HttpClientFactory.createLocationsClient(mockStorageService);
        expect(client).toBeDefined();
    });
});
