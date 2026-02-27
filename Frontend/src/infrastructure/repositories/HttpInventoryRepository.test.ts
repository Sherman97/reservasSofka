import { describe, it, expect, vi } from 'vitest';
import { HttpInventoryRepository } from './HttpInventoryRepository';
import { InventoryItem } from '../../core/domain/entities/InventoryItem';
import type { IHttpClient } from '../../core/ports/services/IHttpClient';

describe('HttpInventoryRepository', () => {
    function createMockHttpClient(overrides: Partial<IHttpClient> = {}): IHttpClient {
        return {
            get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(),
            addRequestInterceptor: vi.fn(), addResponseInterceptor: vi.fn(),
            ...overrides
        };
    }

    const itemDTOs = [
        { id: 'i1', name: 'Proyector', description: 'HD', image: 'img.jpg', quantity: 5, category: 'tech', available: true },
        { id: 'i2', name: 'Monitor', description: '24"', image: 'img2.jpg', quantity: 10, category: 'tech', available: true }
    ];

    describe('getAll()', () => {
        it('debe retornar lista de InventoryItem', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: true, data: itemDTOs }, status: 200 })
            });
            const repo = new HttpInventoryRepository(client);
            const result = await repo.getAll();
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(InventoryItem);
        });

        it('debe lanzar error si ok es false', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: false, message: 'Fetch error' }, status: 200 })
            });
            const repo = new HttpInventoryRepository(client);
            await expect(repo.getAll()).rejects.toThrow('Fetch error');
        });

        it('debe propagar errores de red', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockRejectedValue(new Error('Network error'))
            });
            const repo = new HttpInventoryRepository(client);
            await expect(repo.getAll()).rejects.toThrow('Network error');
        });
    });

    describe('getById()', () => {
        it('debe retornar un InventoryItem', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: true, data: itemDTOs[0] }, status: 200 })
            });
            const repo = new HttpInventoryRepository(client);
            const result = await repo.getById('i1');
            expect(result).toBeInstanceOf(InventoryItem);
            expect(result.id).toBe('i1');
        });

        it('debe lanzar error si mapping falla', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: true, data: null }, status: 200 })
            });
            const repo = new HttpInventoryRepository(client);
            await expect(repo.getById('bad')).rejects.toThrow('Error mapping inventory data');
        });
    });

    describe('getByCityId()', () => {
        it('debe pasar cityId como param', async () => {
            const mockGet = vi.fn().mockResolvedValue({ data: { ok: true, data: itemDTOs }, status: 200 });
            const client = createMockHttpClient({ get: mockGet });
            const repo = new HttpInventoryRepository(client);

            await repo.getByCityId('c1');
            expect(mockGet).toHaveBeenCalledWith('/inventory/equipments', { params: { cityId: 'c1' } });
        });

        it('debe lanzar error si ok es false', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: false, message: 'Error' }, status: 200 })
            });
            const repo = new HttpInventoryRepository(client);
            await expect(repo.getByCityId('c1')).rejects.toThrow('Error');
        });
    });

    describe('search()', () => {
        it('debe pasar criteria como params', async () => {
            const mockGet = vi.fn().mockResolvedValue({ data: { ok: true, data: [itemDTOs[0]] }, status: 200 });
            const client = createMockHttpClient({ get: mockGet });
            const repo = new HttpInventoryRepository(client);

            const result = await repo.search({ category: 'tech' });
            expect(result).toHaveLength(1);
            expect(mockGet).toHaveBeenCalledWith('/inventory/equipments', { params: { category: 'tech' } });
        });
    });
});
