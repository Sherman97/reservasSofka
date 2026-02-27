import { describe, it, expect, vi } from 'vitest';
import { GetUserReservationsUseCase } from './GetUserReservationsUseCase';
import { Reservation } from '../../../core/domain/entities/Reservation';
import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';

describe('GetUserReservationsUseCase', () => {
    const mockReservations = [
        new Reservation({
            id: 'r1', userId: 'u1', locationId: 'l1', locationName: 'Sala A',
            startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z',
            equipment: [], status: 'active', createdAt: new Date().toISOString()
        })
    ];

    const createMockRepo = (overrides: Partial<IReservationRepository> = {}): IReservationRepository => ({
        create: vi.fn(),
        cancel: vi.fn(),
        getByUserId: vi.fn().mockResolvedValue(mockReservations),
        getAvailability: vi.fn(),
        ...overrides
    });

    it('debe retornar reservas del usuario', async () => {
        const repo = createMockRepo();
        const useCase = new GetUserReservationsUseCase(repo);
        const result = await useCase.execute('u1');
        expect(result).toEqual(mockReservations);
        expect(repo.getByUserId).toHaveBeenCalledWith('u1');
    });

    it('debe lanzar error si userId está vacío', async () => {
        const repo = createMockRepo();
        const useCase = new GetUserReservationsUseCase(repo);
        await expect(useCase.execute('')).rejects.toThrow('User ID is required');
    });
});
