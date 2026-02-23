import { describe, it, expect, vi } from 'vitest';
import { GetUserReservationsUseCase } from './GetUserReservationsUseCase';

describe('GetUserReservationsUseCase', () => {
    it('should throw an error if userId is not provided', async () => {
        const mockRepo = { getByUserId: vi.fn() };
        const useCase = new GetUserReservationsUseCase(mockRepo);

        await expect(useCase.execute()).rejects.toThrow('User ID is required');
        expect(mockRepo.getByUserId).not.toHaveBeenCalled();
    });

    it('should return reservations from the repository when userId is provided', async () => {
        const reservations = [
            { id: 1, locationName: 'Sala A' },
            { id: 2, locationName: 'Sala B' }
        ];
        const mockRepo = { getByUserId: vi.fn().mockResolvedValue(reservations) };
        const useCase = new GetUserReservationsUseCase(mockRepo);

        const result = await useCase.execute(123);

        expect(result).toBe(reservations);
        expect(mockRepo.getByUserId).toHaveBeenCalledWith(123);
    });

    it('should propagate errors from the repository', async () => {
        const mockRepo = { getByUserId: vi.fn().mockRejectedValue(new Error('DB Error')) };
        const useCase = new GetUserReservationsUseCase(mockRepo);

        await expect(useCase.execute(123)).rejects.toThrow('DB Error');
    });
});
