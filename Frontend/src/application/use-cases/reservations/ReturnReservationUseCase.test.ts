import { describe, it, expect, vi } from 'vitest';
import { ReturnReservationUseCase } from './ReturnReservationUseCase';
import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';
import { Reservation } from '../../../core/domain/entities/Reservation';

describe('ReturnReservationUseCase', () => {
    const createMockRepo = (overrides: Partial<IReservationRepository> = {}): IReservationRepository => ({
        create: vi.fn(),
        cancel: vi.fn(),
        getByUserId: vi.fn(),
        getById: vi.fn(),
        deliver: vi.fn(),
        returnReservation: vi.fn().mockResolvedValue(
            new Reservation({
                id: 'r1', userId: 'u1', locationId: 'l1', locationName: 'Sala A',
                startAt: new Date().toISOString(), endAt: new Date().toISOString(),
                status: 'completed'
            })
        ),
        getAvailability: vi.fn(),
        ...overrides
    });

    it('debe devolver una reserva con ID válido sin novedad', async () => {
        const repo = createMockRepo();
        const useCase = new ReturnReservationUseCase(repo);
        const result = await useCase.execute('r1');
        expect(repo.returnReservation).toHaveBeenCalledWith('r1', undefined);
        expect(result.status).toBe('completed');
    });

    it('debe devolver una reserva con ID válido y novedad', async () => {
        const repo = createMockRepo();
        const useCase = new ReturnReservationUseCase(repo);
        await useCase.execute('r1', 'Daño en proyector');
        expect(repo.returnReservation).toHaveBeenCalledWith('r1', 'Daño en proyector');
    });

    it('debe lanzar error si reservationId está vacío', async () => {
        const repo = createMockRepo();
        const useCase = new ReturnReservationUseCase(repo);
        await expect(useCase.execute('')).rejects.toThrow('Reservation ID is required');
    });

    it('debe propagar errores del repositorio', async () => {
        const repo = createMockRepo({
            returnReservation: vi.fn().mockRejectedValue(new Error('Server error'))
        });
        const useCase = new ReturnReservationUseCase(repo);
        await expect(useCase.execute('r1')).rejects.toThrow('Server error');
    });
});
