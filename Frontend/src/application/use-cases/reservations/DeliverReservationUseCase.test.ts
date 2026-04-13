import { describe, it, expect, vi } from 'vitest';
import { DeliverReservationUseCase } from './DeliverReservationUseCase';
import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';
import { Reservation } from '../../../core/domain/entities/Reservation';

describe('DeliverReservationUseCase', () => {
    const createMockRepo = (overrides: Partial<IReservationRepository> = {}): IReservationRepository => ({
        create: vi.fn(),
        cancel: vi.fn(),
        getByUserId: vi.fn(),
        getById: vi.fn(),
        deliver: vi.fn().mockResolvedValue(
            new Reservation({
                id: 'r1', userId: 'u1', locationId: 'l1', locationName: 'Sala A',
                startAt: new Date().toISOString(), endAt: new Date().toISOString(),
                status: 'in_progress'
            })
        ),
        returnReservation: vi.fn(),
        getAvailability: vi.fn(),
        ...overrides
    });

    it('debe entregar una reserva con ID válido sin novedad', async () => {
        const repo = createMockRepo();
        const useCase = new DeliverReservationUseCase(repo);
        const result = await useCase.execute('r1');
        expect(repo.deliver).toHaveBeenCalledWith('r1', undefined);
        expect(result.status).toBe('in_progress');
    });

    it('debe entregar una reserva con ID válido y novedad', async () => {
        const repo = createMockRepo();
        const useCase = new DeliverReservationUseCase(repo);
        await useCase.execute('r1', 'Todo en orden');
        expect(repo.deliver).toHaveBeenCalledWith('r1', 'Todo en orden');
    });

    it('debe lanzar error si reservationId está vacío', async () => {
        const repo = createMockRepo();
        const useCase = new DeliverReservationUseCase(repo);
        await expect(useCase.execute('')).rejects.toThrow('Reservation ID is required');
    });

    it('debe propagar errores del repositorio', async () => {
        const repo = createMockRepo({
            deliver: vi.fn().mockRejectedValue(new Error('Network error'))
        });
        const useCase = new DeliverReservationUseCase(repo);
        await expect(useCase.execute('r1')).rejects.toThrow('Network error');
    });
});
