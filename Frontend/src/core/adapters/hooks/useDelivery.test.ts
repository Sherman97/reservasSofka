import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDelivery } from './useDelivery';
import { Delivery } from '../../../core/domain/entities/Delivery';

// Mock del DependencyProvider
vi.mock('../providers/DependencyProvider', () => ({
    useDeliveryDependencies: () => ({
        submitDeliveryUseCase: mockSubmitDeliveryUseCase,
    }),
}));

const mockSubmitDeliveryUseCase = {
    execute: vi.fn(),
};

describe('useDelivery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe inicializar con estado vacío', () => {
        const { result } = renderHook(() => useDelivery());

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.success).toBe(false);
        expect(result.current.delivery).toBeNull();
    });

    it('debe enviar entrega correctamente', async () => {
        const expectedDelivery = new Delivery({
            id: 'd1',
            locationId: 'l1',
            userId: 'u1',
            managerId: 'm1',
            notes: 'Sin novedades',
            date: '2026-02-26T15:00:00',
        });

        mockSubmitDeliveryUseCase.execute.mockResolvedValue(expectedDelivery);

        const { result } = renderHook(() => useDelivery());

        await act(async () => {
            await result.current.submitDelivery({
                locationId: 'l1',
                userId: 'u1',
                managerId: 'm1',
                notes: 'Sin novedades',
                date: '2026-02-26T15:00:00',
            });
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.success).toBe(true);
        expect(result.current.delivery).toBeInstanceOf(Delivery);
        expect(result.current.error).toBeNull();
    });

    it('debe manejar errores al enviar', async () => {
        mockSubmitDeliveryUseCase.execute.mockRejectedValue(
            new Error('Error al enviar la entrega')
        );

        const { result } = renderHook(() => useDelivery());

        await act(async () => {
            await result.current.submitDelivery({
                locationId: 'l1',
                userId: 'u1',
                managerId: 'm1',
                notes: 'Test',
                date: '2026-02-26T15:00:00',
            });
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.success).toBe(false);
        expect(result.current.error).toBe('Error al enviar la entrega');
        expect(result.current.delivery).toBeNull();
    });

    it('debe poner loading en true durante el envío', async () => {
        let resolvePromise: (value: Delivery) => void;
        const promise = new Promise<Delivery>((resolve) => {
            resolvePromise = resolve;
        });

        mockSubmitDeliveryUseCase.execute.mockReturnValue(promise);

        const { result } = renderHook(() => useDelivery());

        act(() => {
            result.current.submitDelivery({
                locationId: 'l1',
                userId: 'u1',
                managerId: 'm1',
                notes: 'Test',
                date: '2026-02-26T15:00:00',
            });
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            resolvePromise!(new Delivery({
                id: 'd2',
                locationId: 'l1',
                userId: 'u1',
                managerId: 'm1',
                notes: 'Test',
                date: '2026-02-26T15:00:00',
            }));
        });

        expect(result.current.loading).toBe(false);
    });

    it('debe resetear el estado con resetDelivery', async () => {
        const expectedDelivery = new Delivery({
            id: 'd3',
            locationId: 'l1',
            userId: 'u1',
            managerId: 'm1',
            notes: 'Test',
            date: '2026-02-26T15:00:00',
        });

        mockSubmitDeliveryUseCase.execute.mockResolvedValue(expectedDelivery);

        const { result } = renderHook(() => useDelivery());

        await act(async () => {
            await result.current.submitDelivery({
                locationId: 'l1',
                userId: 'u1',
                managerId: 'm1',
                notes: 'Test',
                date: '2026-02-26T15:00:00',
            });
        });

        expect(result.current.success).toBe(true);

        act(() => {
            result.current.resetDelivery();
        });

        expect(result.current.success).toBe(false);
        expect(result.current.delivery).toBeNull();
        expect(result.current.error).toBeNull();
    });
});
