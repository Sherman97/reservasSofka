import { expect, describe, it, vi, beforeEach } from 'vitest';
import { UpdateReservationUseCase } from './UpdateReservationUseCase';
import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';
import type { Reservation } from '../../../core/domain/entities/Reservation';

describe('UpdateReservationUseCase', () => {
    let mockRepository: ReturnType<typeof vi.fn> & IReservationRepository;
    let useCase: UpdateReservationUseCase;

    beforeEach(() => {
        mockRepository = {
            create: vi.fn(),
            update: vi.fn(),
            getByUserId: vi.fn(),
            getById: vi.fn(),
            cancel: vi.fn(),
            deliver: vi.fn(),
            returnReservation: vi.fn(),
            getAvailability: vi.fn()
        } as unknown as ReturnType<typeof vi.fn> & IReservationRepository;

        useCase = new UpdateReservationUseCase(mockRepository);
    });

    it('should call repository.update with the correct parameters', async () => {
        const id = '123';
        const updateData = { title: 'New Title' };
        
        const mockReservation = { id, title: 'New Title' } as Reservation;
        (mockRepository.update as import('vitest').Mock)
          .mockResolvedValue(mockReservation);

        const result = await useCase.execute(id, updateData);

        expect(mockRepository.update).toHaveBeenCalledWith(id, updateData);
        expect(result).toEqual(mockReservation);
    });

    it('should throw an error if no ID is provided', async () => {
        await expect(useCase.execute('', { title: 'Title' })).rejects.toThrow('Reservation ID is required');
    });

    it('should throw an error if no update data is provided', async () => {
        await expect(useCase.execute('123', {})).rejects.toThrow('Update data cannot be empty');
    });
});
