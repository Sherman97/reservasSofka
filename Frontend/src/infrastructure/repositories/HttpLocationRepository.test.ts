import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpLocationRepository } from './HttpLocationRepository';
import { Location } from '../../core/domain/entities/Location';
import type { IHttpClient } from '../../core/ports/services/IHttpClient';

describe('HttpLocationRepository', () => {
    beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}); });
    afterEach(() => { vi.restoreAllMocks(); });
    function createMockHttpClient(overrides: Partial<IHttpClient> = {}): IHttpClient {
        return {
            get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(),
            addRequestInterceptor: vi.fn(), addResponseInterceptor: vi.fn(),
            ...overrides
        };
    }

    const locationDTOs = [
        { id: 'l1', name: 'Sala A', description: 'Desc', image: 'img.jpg', capacity: 10, type: 'sala', cityId: 'c1' },
        { id: 'l2', name: 'Sala B', description: 'Desc2', image: 'img2.jpg', capacity: 20, type: 'sala', cityId: 'c2' }
    ];

    describe('getAll()', () => {
        it('debe retornar lista de Location', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: true, data: locationDTOs }, status: 200 })
            });
            const repo = new HttpLocationRepository(client);
            const result = await repo.getAll();
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Location);
            expect(result[0].name).toBe('Sala A');
        });

        it('debe lanzar error si ok es false', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: false, message: 'Server error' }, status: 200 })
            });
            const repo = new HttpLocationRepository(client);
            await expect(repo.getAll()).rejects.toThrow('Server error');
        });

        it('debe propagar errores de red', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockRejectedValue(new Error('Network error'))
            });
            const repo = new HttpLocationRepository(client);
            await expect(repo.getAll()).rejects.toThrow('Network error');
        });
    });

    describe('getById()', () => {
        it('debe retornar una Location', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: true, data: locationDTOs[0] }, status: 200 })
            });
            const repo = new HttpLocationRepository(client);
            const result = await repo.getById('l1');
            expect(result).toBeInstanceOf(Location);
            expect(result.id).toBe('l1');
        });

        it('debe lanzar error si ok es false', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: false, message: 'Not found' }, status: 404 })
            });
            const repo = new HttpLocationRepository(client);
            await expect(repo.getById('xxx')).rejects.toThrow('Not found');
        });
    });

    describe('search()', () => {
        it('debe pasar criteria como params', async () => {
            const mockGet = vi.fn().mockResolvedValue({ data: { ok: true, data: [locationDTOs[0]] }, status: 200 });
            const client = createMockHttpClient({ get: mockGet });
            const repo = new HttpLocationRepository(client);

            const result = await repo.search({ type: 'sala' });
            expect(result).toHaveLength(1);
            expect(mockGet).toHaveBeenCalledWith('/locations/spaces', { params: { type: 'sala' } });
        });
    });

    describe('assignInventory()', () => {
        it('debe hacer POST para asignar inventario', async () => {
            const mockPost = vi.fn().mockResolvedValue({ data: { ok: true, data: { success: true } }, status: 200 });
            const client = createMockHttpClient({ post: mockPost });
            const repo = new HttpLocationRepository(client);

            const result = await repo.assignInventory('l1', 'i1', 3);
            expect(result).toEqual({ success: true });
            expect(mockPost).toHaveBeenCalledWith('/locations/l1/inventory', { inventoryId: 'i1', qty: 3 });
        });

        it('debe lanzar error si ok es false', async () => {
            const client = createMockHttpClient({
                post: vi.fn().mockResolvedValue({ data: { ok: false, message: 'Not found' }, status: 404 })
            });
            const repo = new HttpLocationRepository(client);
            await expect(repo.assignInventory('l1', 'i1', 3)).rejects.toThrow('Not found');
        });
    });

    describe('removeInventory()', () => {
        it('debe hacer DELETE para remover inventario', async () => {
            const mockDelete = vi.fn().mockResolvedValue({ data: { ok: true, data: { success: true } }, status: 200 });
            const client = createMockHttpClient({ delete: mockDelete });
            const repo = new HttpLocationRepository(client);

            const result = await repo.removeInventory('l1', 'i1');
            expect(result).toEqual({ success: true });
            expect(mockDelete).toHaveBeenCalledWith('/locations/l1/inventory/i1');
        });
    });

    describe('respuestas directas (sin wrapper { ok, data })', () => {
        it('getAll() debe manejar un array directo', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: locationDTOs, status: 200 })
            });
            const repo = new HttpLocationRepository(client);
            const result = await repo.getAll();
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Location);
            expect(result[0].name).toBe('Sala A');
        });

        it('getById() debe manejar un objeto directo', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: locationDTOs[0], status: 200 })
            });
            const repo = new HttpLocationRepository(client);
            const result = await repo.getById('l1');
            expect(result).toBeInstanceOf(Location);
            expect(result.id).toBe('l1');
        });

        it('search() debe manejar un array directo', async () => {
            const mockGet = vi.fn().mockResolvedValue({ data: [locationDTOs[1]], status: 200 });
            const client = createMockHttpClient({ get: mockGet });
            const repo = new HttpLocationRepository(client);

            const result = await repo.search({ type: 'sala' });
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Sala B');
        });

        it('assignInventory() debe manejar respuesta directa', async () => {
            const mockPost = vi.fn().mockResolvedValue({ data: { assigned: true }, status: 200 });
            const client = createMockHttpClient({ post: mockPost });
            const repo = new HttpLocationRepository(client);

            const result = await repo.assignInventory('l1', 'i1', 3);
            expect(result).toEqual({ assigned: true });
        });

        it('removeInventory() debe manejar respuesta directa', async () => {
            const mockDelete = vi.fn().mockResolvedValue({ data: { removed: true }, status: 200 });
            const client = createMockHttpClient({ delete: mockDelete });
            const repo = new HttpLocationRepository(client);

            const result = await repo.removeInventory('l1', 'i1');
            expect(result).toEqual({ removed: true });
        });
    });
});
