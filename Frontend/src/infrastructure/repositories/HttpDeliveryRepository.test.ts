import { describe, it, expect, vi } from 'vitest';
import { HttpDeliveryRepository } from './HttpDeliveryRepository';
import { Delivery } from '../../core/domain/entities/Delivery';
import type { IHttpClient } from '../../core/ports/services/IHttpClient';

describe('HttpDeliveryRepository', () => {
    function createMockHttpClient(overrides: Partial<IHttpClient> = {}): IHttpClient {
        return {
            get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(),
            addRequestInterceptor: vi.fn(), addResponseInterceptor: vi.fn(),
            ...overrides
        };
    }

    describe('submit()', () => {
        it('debe enviar delivery y retornar entidad (respuesta con wrapper ok)', async () => {
            const deliveryDTO = {
                id: 'd1', locationId: 'l1', userId: 'u1',
                managerId: 'm1', notes: 'Test note', date: '2026-03-01'
            };
            const client = createMockHttpClient({
                post: vi.fn().mockResolvedValue({ data: { ok: true, data: deliveryDTO }, status: 201 })
            });
            const repo = new HttpDeliveryRepository(client);

            const result = await repo.submit({
                locationId: 'l1', userId: 'u1', managerId: 'm1', notes: 'Test note', date: '2026-03-01'
            });
            expect(result).toBeInstanceOf(Delivery);
            expect(result.id).toBe('d1');
        });

        it('debe enviar delivery y retornar entidad (respuesta directa sin wrapper)', async () => {
            const deliveryDTO = {
                id: 'd2', locationId: 'l1', userId: 'u1',
                managerId: 'm1', notes: 'Direct', date: '2026-03-01'
            };
            const client = createMockHttpClient({
                post: vi.fn().mockResolvedValue({ data: deliveryDTO, status: 201 })
            });
            const repo = new HttpDeliveryRepository(client);

            const result = await repo.submit({
                locationId: 'l1', userId: 'u1', managerId: 'm1', notes: 'Direct', date: '2026-03-01'
            });
            expect(result).toBeInstanceOf(Delivery);
            expect(result.id).toBe('d2');
        });

        it('debe lanzar error si ok es false', async () => {
            const client = createMockHttpClient({
                post: vi.fn().mockResolvedValue({ data: { ok: false, message: 'Error' }, status: 400 })
            });
            const repo = new HttpDeliveryRepository(client);

            await expect(repo.submit({ locationId: 'l1', userId: 'u1', managerId: 'm1', date: '2026-03-01' }))
                .rejects.toThrow('Error');
        });

        it('debe propagar errores de red', async () => {
            const client = createMockHttpClient({
                post: vi.fn().mockRejectedValue(new Error('Network error'))
            });
            const repo = new HttpDeliveryRepository(client);

            await expect(repo.submit({ locationId: 'l1', userId: 'u1', managerId: 'm1', date: '2026-03-01' }))
                .rejects.toThrow('Network error');
        });

        it('debe lanzar error si mapping retorna null', async () => {
            const client = createMockHttpClient({
                post: vi.fn().mockResolvedValue({ data: { ok: true, data: null }, status: 201 })
            });
            const repo = new HttpDeliveryRepository(client);

            await expect(repo.submit({ locationId: 'l1', userId: 'u1', managerId: 'm1', date: '2026-03-01' }))
                .rejects.toThrow('Error mapping delivery data');
        });
    });
});
