import { describe, it, expect, vi } from 'vitest';
import { GetSpaceAvailabilityUseCase } from './GetSpaceAvailabilityUseCase';
import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';

describe('GetSpaceAvailabilityUseCase', () => {
    const mockAvailability = {
        busySlots: [
            { startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' }
        ]
    };

    const createMockRepo = (overrides: Partial<IReservationRepository> = {}): IReservationRepository => ({
        create: vi.fn(),
        cancel: vi.fn(),
        getByUserId: vi.fn(),
        getAvailability: vi.fn().mockResolvedValue(mockAvailability),
        ...overrides
    });

    it('debe retornar disponibilidad con datos válidos', async () => {
        const repo = createMockRepo();
        const useCase = new GetSpaceAvailabilityUseCase(repo);
        const result = await useCase.execute('s1', '2026-03-01');
        expect(result.busySlots).toEqual(mockAvailability.busySlots);
        expect(repo.getAvailability).toHaveBeenCalledWith('s1', '2026-03-01');
    });

    it('debe lanzar error si spaceId falta', async () => {
        const repo = createMockRepo();
        const useCase = new GetSpaceAvailabilityUseCase(repo);
        await expect(useCase.execute('', '2026-03-01'))
            .rejects.toThrow('Space ID is required');
    });

    it('debe lanzar error si date falta', async () => {
        const repo = createMockRepo();
        const useCase = new GetSpaceAvailabilityUseCase(repo);
        await expect(useCase.execute('s1', ''))
            .rejects.toThrow('Date is required');
    });

    it('debe retornar busySlots vacío si no hay resultado', async () => {
        const repo = createMockRepo({
            getAvailability: vi.fn().mockResolvedValue({ busySlots: undefined })
        });
        const useCase = new GetSpaceAvailabilityUseCase(repo);
        const result = await useCase.execute('s1', '2026-03-01');
        expect(result.busySlots).toEqual([]);
    });
});
