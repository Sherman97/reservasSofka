import { describe, it, expect, vi } from 'vitest';
import { CancelReservationUseCase } from './CancelReservationUseCase';
import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';

describe('CancelReservationUseCase', () => {
    const createMockRepo = (overrides: Partial<IReservationRepository> = {}): IReservationRepository => ({
        create: vi.fn(),
        cancel: vi.fn().mockResolvedValue(undefined),
        getByUserId: vi.fn(),
        getAvailability: vi.fn(),
        ...overrides
    });

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
