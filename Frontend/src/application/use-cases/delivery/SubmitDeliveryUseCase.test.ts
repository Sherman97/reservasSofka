import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubmitDeliveryUseCase } from './SubmitDeliveryUseCase';
import type { IDeliveryRepository } from '../../../core/ports/repositories/IDeliveryRepository';
import { Delivery } from '../../../core/domain/entities/Delivery';

describe('SubmitDeliveryUseCase', () => {
    let useCase: SubmitDeliveryUseCase;
    let mockRepository: IDeliveryRepository;

    beforeEach(() => {
        mockRepository = {
            submit: vi.fn(),
        };
        useCase = new SubmitDeliveryUseCase(mockRepository);
    });

    it('debe enviar la entrega correctamente con todos los campos', async () => {
        const deliveryData = {
            locationId: 'l1',
            userId: 'u1',
            managerId: 'm1',
            notes: 'Sin novedades',
            date: '2026-02-26T15:00:00',
        };

        const expectedDelivery = new Delivery({
            id: 'd-generated',
            ...deliveryData,
        });

        (mockRepository.submit as ReturnType<typeof vi.fn>).mockResolvedValue(expectedDelivery);

        const result = await useCase.execute(deliveryData);

        expect(mockRepository.submit).toHaveBeenCalledWith(deliveryData);
        expect(result).toBeInstanceOf(Delivery);
        expect(result.locationId).toBe('l1');
        expect(result.managerId).toBe('m1');
    });

    it('debe lanzar error si falta locationId', async () => {
        const deliveryData = {
            locationId: '',
            userId: 'u1',
            managerId: 'm1',
            notes: 'Test',
            date: '2026-02-26T15:00:00',
        };

        await expect(useCase.execute(deliveryData)).rejects.toThrow('Location ID is required');
    });

    it('debe lanzar error si falta userId', async () => {
        const deliveryData = {
            locationId: 'l1',
            userId: '',
            managerId: 'm1',
            notes: 'Test',
            date: '2026-02-26T15:00:00',
        };

        await expect(useCase.execute(deliveryData)).rejects.toThrow('User ID is required');
    });

    it('debe lanzar error si falta managerId', async () => {
        const deliveryData = {
            locationId: 'l1',
            userId: 'u1',
            managerId: '',
            notes: 'Test',
            date: '2026-02-26T15:00:00',
        };

        await expect(useCase.execute(deliveryData)).rejects.toThrow('Manager ID is required');
    });

    it('debe propagar errores del repository', async () => {
        const deliveryData = {
            locationId: 'l1',
            userId: 'u1',
            managerId: 'm1',
            notes: 'Test',
            date: '2026-02-26T15:00:00',
        };

        (mockRepository.submit as ReturnType<typeof vi.fn>).mockRejectedValue(
            new Error('Network error')
        );

        await expect(useCase.execute(deliveryData)).rejects.toThrow('Network error');
    });
});
