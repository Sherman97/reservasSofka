import { describe, it, expect, vi } from 'vitest';
import { UpdateReservationTimeUseCase } from './UpdateReservationTimeUseCase';
import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';
import { Reservation } from '../../../core/domain/entities/Reservation';

describe('UpdateReservationTimeUseCase', () => {
    const createMockRepo = (overrides: Partial<IReservationRepository> = {}): IReservationRepository => ({
        create: vi.fn(),
        getByUserId: vi.fn(),
        getById: vi.fn(),
        cancel: vi.fn(),
        deliver: vi.fn(),
        returnReservation: vi.fn(),
        getAvailability: vi.fn(),
        updateTime: vi.fn().mockResolvedValue(
            new Reservation({
                id: 'r1',
                userId: 'u1',
                locationId: 'l1',
                locationName: 'Sala A',
                startAt: '2026-03-01T13:00:00Z',
                endAt: '2026-03-01T14:00:00Z',
                status: 'active',
                equipment: []
            })
        ),
        ...overrides
    });

    it('debe actualizar la hora de una reserva con datos válidos', async () => {
        const repo = createMockRepo();
        const useCase = new UpdateReservationTimeUseCase(repo);

        const result = await useCase.execute('r1', '2026-03-01', '13:00', '14:00');

        expect(repo.updateTime).toHaveBeenCalledWith('r1', '2026-03-01', '13:00', '14:00');
        expect(result).toBeInstanceOf(Reservation);
    });

    it('debe lanzar error si falta reservationId', async () => {
        const useCase = new UpdateReservationTimeUseCase(createMockRepo());
        await expect(useCase.execute('', '2026-03-01', '13:00', '14:00')).rejects.toThrow('Reservation ID is required');
    });

    it('debe lanzar error si falta fecha', async () => {
        const useCase = new UpdateReservationTimeUseCase(createMockRepo());
        await expect(useCase.execute('r1', '', '13:00', '14:00')).rejects.toThrow('Reservation date is required');
    });

    it('debe lanzar error si la hora de fin no es posterior', async () => {
        const useCase = new UpdateReservationTimeUseCase(createMockRepo());
        await expect(useCase.execute('r1', '2026-03-01', '14:00', '13:00')).rejects.toThrow('End time must be later than start time');
    });

    it('debe lanzar error si el repositorio no soporta updateTime', async () => {
        const repo = createMockRepo({ updateTime: undefined });
        const useCase = new UpdateReservationTimeUseCase(repo);
        await expect(useCase.execute('r1', '2026-03-01', '13:00', '14:00')).rejects.toThrow('Reservation update is not available');
    });
});

