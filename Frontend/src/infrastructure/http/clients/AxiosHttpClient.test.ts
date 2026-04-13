import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosHttpClient } from './AxiosHttpClient';

// Mock axios
vi.mock('axios', () => {
    const mockInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
        }
    };
    return {
        default: {
            create: vi.fn(() => mockInstance)
        },
        __mockInstance: mockInstance
    };
});

import axios from 'axios';

// @ts-expect-error accessing mock internals
const mockInstance = axios.__mockInstance || (axios as any).create();

describe('AxiosHttpClient', () => {
    let client: AxiosHttpClient;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        // Re-get the mock instance after clearAllMocks  
        (axios.create as ReturnType<typeof vi.fn>).mockReturnValue(mockInstance);
        client = new AxiosHttpClient('http://localhost:3000');
    });

    afterEach(() => { vi.restoreAllMocks(); });

    it('debe crear instancia con baseURL', () => {
        expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
            baseURL: 'http://localhost:3000',
            headers: expect.objectContaining({ 'Content-Type': 'application/json' })
        }));
    });

    it('get debe retornar data y status', async () => {
        mockInstance.get.mockResolvedValue({ data: { id: 1 }, status: 200 });

        const result = await client.get('/users');

        expect(mockInstance.get).toHaveBeenCalledWith('/users', {});
        expect(result).toEqual({ data: { id: 1 }, status: 200 });
    });

    it('post debe enviar datos', async () => {
        mockInstance.post.mockResolvedValue({ data: { id: 1 }, status: 201 });

        const result = await client.post('/users', { name: 'Test' });

        expect(mockInstance.post).toHaveBeenCalledWith('/users', { name: 'Test' }, {});
        expect(result).toEqual({ data: { id: 1 }, status: 201 });
    });

    it('put debe enviar datos', async () => {
        mockInstance.put.mockResolvedValue({ data: { id: 1 }, status: 200 });

        const result = await client.put('/users/1', { name: 'Updated' });

        expect(mockInstance.put).toHaveBeenCalledWith('/users/1', { name: 'Updated' }, {});
        expect(result).toEqual({ data: { id: 1 }, status: 200 });
    });

    it('patch debe enviar datos', async () => {
        mockInstance.patch.mockResolvedValue({ data: { id: 1 }, status: 200 });

        const result = await client.patch('/users/1', { name: 'Patched' });

        expect(mockInstance.patch).toHaveBeenCalledWith('/users/1', { name: 'Patched' }, {});
        expect(result).toEqual({ data: { id: 1 }, status: 200 });
    });

    it('delete debe eliminar recurso', async () => {
        mockInstance.delete.mockResolvedValue({ data: null, status: 204 });

        const result = await client.delete('/users/1');

        expect(mockInstance.delete).toHaveBeenCalledWith('/users/1', {});
        expect(result).toEqual({ data: null, status: 204 });
    });

    it('get debe lanzar error formateado en falla', async () => {
        mockInstance.get.mockRejectedValue({
            response: { data: { message: 'Not found' }, status: 404 }
        });

        try {
            await client.get('/users/999');
            expect.unreachable('Should have thrown');
        } catch (error: any) {
            expect(error.message).toBe('Not found');
            expect(error.status).toBe(404);
        }
    });

    it('post debe lanzar error formateado en falla', async () => {
        mockInstance.post.mockRejectedValue({
            message: 'Network error occurred'
        });

        try {
            await client.post('/users', {});
            expect.unreachable('Should have thrown');
        } catch (error: any) {
            expect(error.message).toBe('Network error occurred');
        }
    });

    it('put debe manejar error sin response', async () => {
        mockInstance.put.mockRejectedValue({});

        try {
            await client.put('/users/1', {});
            expect.unreachable('Should have thrown');
        } catch (error: any) {
            expect(error.message).toBe('Network error occurred');
        }
    });

    it('patch debe manejar error', async () => {
        mockInstance.patch.mockRejectedValue({
            response: { data: { message: 'Conflict' }, status: 409 }
        });

        try {
            await client.patch('/users/1', {});
            expect.unreachable('Should have thrown');
        } catch (error: any) {
            expect(error.message).toBe('Conflict');
            expect(error.status).toBe(409);
        }
    });

    it('delete debe manejar error', async () => {
        mockInstance.delete.mockRejectedValue({
            response: { data: { message: 'Forbidden' }, status: 403 }
        });

        try {
            await client.delete('/users/1');
            expect.unreachable('Should have thrown');
        } catch (error: any) {
            expect(error.message).toBe('Forbidden');
        }
    });

    it('addRequestInterceptor debe registrar interceptor', () => {
        const interceptor = vi.fn((config) => config);
        client.addRequestInterceptor(interceptor);
        expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
    });

    it('addResponseInterceptor debe registrar interceptores', () => {
        const onSuccess = vi.fn((r) => r);
        const onError = vi.fn((e) => e);
        client.addResponseInterceptor(onSuccess, onError);
        expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
    });
});
