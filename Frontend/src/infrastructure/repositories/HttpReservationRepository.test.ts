import { describe, it, expect, vi } from 'vitest';
import { HttpReservationRepository } from './HttpReservationRepository';
import { Reservation } from '../../core/domain/entities/Reservation';
import type { IHttpClient } from '../../core/ports/services/IHttpClient';
import type { IStorageService } from '../../core/ports/services/IStorageService';

describe('HttpReservationRepository', () => {
    function createMockHttpClient(overrides: Partial<IHttpClient> = {}): IHttpClient {
        return {
            get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(),
            addRequestInterceptor: vi.fn(), addResponseInterceptor: vi.fn(),
            ...overrides
        };
    }

    function createMockStorage(): IStorageService {
        return {
            get: vi.fn(), set: vi.fn(), remove: vi.fn(), clear: vi.fn(),
            has: vi.fn(), getJSON: vi.fn(), setJSON: vi.fn()
        };
    }

    const reservationDTO = {
        id: 'r1', userId: 'u1', spaceId: 'l1', spaceName: 'Sala A',
        startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z',
        equipments: [], status: 'active', createdAt: '2026-02-28T12:00:00Z'
    };

    describe('create()', () => {
        it('debe crear una reserva', async () => {
            const client = createMockHttpClient({
                post: vi.fn().mockResolvedValue({ data: { ok: true, data: reservationDTO }, status: 201 })
            });
            const repo = new HttpReservationRepository(client, createMockStorage());

            const result = await repo.create({
                locationId: 'l1', date: '2026-03-01', startTime: '10:00', endTime: '11:00'
            } as Record<string, unknown>);
            expect(result).toBeInstanceOf(Reservation);
            expect(result.id).toBe('r1');
        });

        it('debe lanzar error si ok es false', async () => {
            const client = createMockHttpClient({
                post: vi.fn().mockResolvedValue({ data: { ok: false, message: 'Conflict' }, status: 409 })
            });
            const repo = new HttpReservationRepository(client, createMockStorage());

            await expect(repo.create({ locationId: 'l1', date: '2026-03-01', startTime: '10:00', endTime: '11:00' } as Record<string, unknown>))
                .rejects.toThrow('Conflict');
        });

        it('debe propagar errores de red', async () => {
            const client = createMockHttpClient({
                post: vi.fn().mockRejectedValue(new Error('Network error'))
            });
            const repo = new HttpReservationRepository(client, createMockStorage());

            await expect(repo.create({ locationId: 'l1', date: '2026-03-01', startTime: '10:00', endTime: '11:00' } as Record<string, unknown>))
                .rejects.toThrow('Network error');
        });
    });

    describe('getByUserId()', () => {
        it('debe retornar lista de reservas', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: true, data: [reservationDTO] }, status: 200 })
            });
            const repo = new HttpReservationRepository(client, createMockStorage());

            const result = await repo.getByUserId('u1');
            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(Reservation);
        });

        it('debe lanzar error si ok es false', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: false, message: 'Error' }, status: 200 })
            });
            const repo = new HttpReservationRepository(client, createMockStorage());

            await expect(repo.getByUserId('u1')).rejects.toThrow('Error');
        });
    });

    describe('getById()', () => {
        it('debe retornar una reserva', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: true, data: reservationDTO }, status: 200 })
            });
            const repo = new HttpReservationRepository(client, createMockStorage());

            const result = await repo.getById('r1');
            expect(result).toBeInstanceOf(Reservation);
            expect(result.id).toBe('r1');
        });
    });

    describe('cancel()', () => {
        it('debe cancelar una reserva', async () => {
            const mockPatch = vi.fn().mockResolvedValue({ data: { ok: true }, status: 200 });
            const client = createMockHttpClient({ patch: mockPatch });
            const repo = new HttpReservationRepository(client, createMockStorage());

            await repo.cancel('r1');
            expect(mockPatch).toHaveBeenCalledWith('/bookings/reservations/r1/cancel');
        });

        it('debe lanzar error si ok es false', async () => {
            const client = createMockHttpClient({
                patch: vi.fn().mockResolvedValue({ data: { ok: false, message: 'Cannot cancel' }, status: 400 })
            });
            const repo = new HttpReservationRepository(client, createMockStorage());

            await expect(repo.cancel('r1')).rejects.toThrow('Cannot cancel');
        });
    });

    describe('getAvailability()', () => {
        it('debe retornar slots ocupados', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({
                    data: {
                        ok: true,
                        data: [
                            { status: 'active', startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' }
                        ]
                    },
                    status: 200
                })
            });
            const repo = new HttpReservationRepository(client, createMockStorage());

            const result = await repo.getAvailability('l1', '2026-03-01');
            expect(result.locationId).toBe('l1');
            expect(result.date).toBe('2026-03-01');
        });

        it('debe retornar slots vacíos si ok es false', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({ data: { ok: false, message: 'Error' }, status: 200 })
            });
            const repo = new HttpReservationRepository(client, createMockStorage());

            const result = await repo.getAvailability('l1', '2026-03-01');
            expect(result.busySlots).toEqual([]);
        });

        it('debe filtrar reservas canceladas', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockResolvedValue({
                    data: {
                        ok: true,
                        data: [
                            { status: 'cancelled', startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' },
                            { status: 'rejected', startAt: '2026-03-01T12:00:00Z', endAt: '2026-03-01T13:00:00Z' }
                        ]
                    },
                    status: 200
                })
            });
            const repo = new HttpReservationRepository(client, createMockStorage());

            const result = await repo.getAvailability('l1', '2026-03-01');
            expect(result.busySlots).toEqual([]);
        });

        it('debe manejar errores de red sin lanzar', async () => {
            const client = createMockHttpClient({
                get: vi.fn().mockRejectedValue(new Error('Network error'))
            });
            const repo = new HttpReservationRepository(client, createMockStorage());

            const result = await repo.getAvailability('l1', '2026-03-01');
            expect(result.busySlots).toEqual([]);
        });
    });
});
