import { describe, it, expect, vi } from 'vitest';
import { CreateReservationUseCase } from './CreateReservationUseCase';
import { Reservation } from '../../../core/domain/entities/Reservation';
import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';

describe('CreateReservationUseCase', () => {
    const mockReservation = new Reservation({
        id: 'r1', userId: 'u1', locationId: 'l1', locationName: 'Sala A',
        startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z',
        equipment: [], status: 'active', createdAt: new Date().toISOString()
    });

    const createMockRepo = (overrides: Partial<IReservationRepository> = {}): IReservationRepository => ({
        create: vi.fn().mockResolvedValue(mockReservation),
        cancel: vi.fn(),
        getByUserId: vi.fn(),
        getAvailability: vi.fn(),
        ...overrides
    });

    const validData = {
        locationId: 'l1',
        date: '2026-03-01',
        startTime: '10:00',
        endTime: '11:00'
    };

    it('debe crear una reserva con datos válidos', async () => {
        const repo = createMockRepo();
        const useCase = new CreateReservationUseCase(repo);
        const result = await useCase.execute(validData);
        expect(result).toBe(mockReservation);
        expect(repo.create).toHaveBeenCalled();
    });

    it('debe lanzar error si locationId falta', async () => {
        const repo = createMockRepo();
        const useCase = new CreateReservationUseCase(repo);
        await expect(useCase.execute({ ...validData, locationId: '' }))
            .rejects.toThrow('Location ID is required');
    });

    it('debe lanzar error si date falta', async () => {
        const repo = createMockRepo();
        const useCase = new CreateReservationUseCase(repo);
        await expect(useCase.execute({ ...validData, date: '' }))
            .rejects.toThrow('Date is required');
    });

    it('debe lanzar error si startTime falta', async () => {
        const repo = createMockRepo();
        const useCase = new CreateReservationUseCase(repo);
        await expect(useCase.execute({ ...validData, startTime: '' }))
            .rejects.toThrow('Start time and end time are required');
    });

    it('debe lanzar error si endTime falta', async () => {
        const repo = createMockRepo();
        const useCase = new CreateReservationUseCase(repo);
        await expect(useCase.execute({ ...validData, endTime: '' }))
            .rejects.toThrow('Start time and end time are required');
    });

    it('debe lanzar error si end time es antes de start time', async () => {
        const repo = createMockRepo();
        const useCase = new CreateReservationUseCase(repo);
        await expect(useCase.execute({ ...validData, startTime: '11:00', endTime: '10:00' }))
            .rejects.toThrow('End time must be after start time');
    });

    it('debe lanzar error si duración es menor a 30 minutos', async () => {
        const repo = createMockRepo();
        const useCase = new CreateReservationUseCase(repo);
        await expect(useCase.execute({ ...validData, startTime: '10:00', endTime: '10:20' }))
            .rejects.toThrow('Reservation must be at least 30 minutes');
    });

    it('debe aceptar reserva de exactamente 30 minutos', async () => {
        const repo = createMockRepo();
        const useCase = new CreateReservationUseCase(repo);
        const result = await useCase.execute({ ...validData, startTime: '10:00', endTime: '10:30' });
        expect(result).toBe(mockReservation);
    });
});
