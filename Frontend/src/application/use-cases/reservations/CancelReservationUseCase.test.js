import { describe, it, expect, vi } from 'vitest';
import { CancelReservationUseCase } from './CancelReservationUseCase';

describe('CancelReservationUseCase', () => {
    it('should cancel reservation successfully', async () => {
        const mockRepo = { cancel: vi.fn().mockResolvedValue(undefined) };
        const useCase = new CancelReservationUseCase(mockRepo);

        await useCase.execute('res-123');

        expect(mockRepo.cancel).toHaveBeenCalledWith('res-123');
    });

    it('should throw error when reservationId is not provided', async () => {
        const mockRepo = { cancel: vi.fn() };
        const useCase = new CancelReservationUseCase(mockRepo);

        await expect(useCase.execute()).rejects.toThrow('Reservation ID is required');
        expect(mockRepo.cancel).not.toHaveBeenCalled();
    });

    it('should throw error when reservationId is empty string', async () => {
        const mockRepo = { cancel: vi.fn() };
        const useCase = new CancelReservationUseCase(mockRepo);

        await expect(useCase.execute('')).rejects.toThrow('Reservation ID is required');
    });

    it('should propagate repository errors', async () => {
        const mockRepo = { cancel: vi.fn().mockRejectedValue(new Error('Not found')) };
        const useCase = new CancelReservationUseCase(mockRepo);

        await expect(useCase.execute('res-404')).rejects.toThrow('Not found');
    });
});
