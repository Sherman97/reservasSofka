import { describe, it, expect, vi } from 'vitest';
import { CancelReservationUseCase } from './CancelReservationUseCase';
import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';

describe('CancelReservationUseCase', () => {
    const createMockRepo = (overrides: Partial<IReservationRepository> = {}): IReservationRepository => ({
        create: vi.fn(),
        update: vi.fn(),
        cancel: vi.fn().mockResolvedValue(undefined),
        getByUserId: vi.fn(),
        getById: vi.fn(),
        checkIn: vi.fn(),
        deliver: vi.fn(),
        returnReservation: vi.fn(),
        getAvailability: vi.fn(),
        ...overrides
    } as unknown as IReservationRepository);

    it('debe cancelar una reserva con ID válido', async () => {
        const repo = createMockRepo();
        const useCase = new CancelReservationUseCase(repo);
        await useCase.execute('r1');
        expect(repo.cancel).toHaveBeenCalledWith('r1');
    });

    it('debe lanzar error si reservationId está vacío', async () => {
        const repo = createMockRepo();
        const useCase = new CancelReservationUseCase(repo);
        await expect(useCase.execute('')).rejects.toThrow('Reservation ID is required');
    });
});
