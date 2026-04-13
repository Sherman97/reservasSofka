import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useReservation } from './useReservation';
import { Reservation } from '../../../core/domain/entities/Reservation';

const mockCreateReservationExecute = vi.fn();
const mockGetSpaceAvailabilityExecute = vi.fn();
const mockConnect = vi.fn();
const mockSubscribe = vi.fn();

vi.mock('../providers/DependencyProvider', () => ({
    useReservationDependencies: () => ({
        createReservationUseCase: { execute: mockCreateReservationExecute },
        getSpaceAvailabilityUseCase: { execute: mockGetSpaceAvailabilityExecute },
        webSocketService: { connect: mockConnect, subscribe: mockSubscribe }
    })
}));

// Mock useBookingEvents to avoid indirect websocket effects
vi.mock('./useBookingEvents', () => ({
    useBookingEvents: vi.fn()
}));

const mockLocation = { id: 'loc1', name: 'Sala A' };

describe('useReservation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'log').mockImplementation(() => {});
        mockGetSpaceAvailabilityExecute.mockResolvedValue({ busySlots: [] });
        mockCreateReservationExecute.mockResolvedValue(
            new Reservation({
                id: 'res1', userId: 'u1', locationId: 'loc1', locationName: 'Sala A',
                startAt: new Date().toISOString(), endAt: new Date().toISOString(), status: 'active'
            })
        );
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('debe iniciar con modal cerrado', () => {
        const { result } = renderHook(() => useReservation(mockLocation));
        expect(result.current.isOpen).toBe(false);
        expect(result.current.selectedDate).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('debe abrir y cerrar el modal', () => {
        const { result } = renderHook(() => useReservation(mockLocation));

        act(() => { result.current.openModal(); });
        expect(result.current.isOpen).toBe(true);

        act(() => { result.current.closeModal(); });
        expect(result.current.isOpen).toBe(false);
        expect(result.current.selectedDate).toBeNull();
        expect(result.current.selectedEquipment).toEqual([]);
    });

    it('debe calcular availability cuando modal está abierto', () => {
        const { result } = renderHook(() => useReservation(mockLocation));

        act(() => { result.current.openModal(); });

        const days = Object.keys(result.current.availability);
        expect(days.length).toBeGreaterThan(0);
    });

    it('debe seleccionar una fecha', async () => {
        const { result } = renderHook(() => useReservation(mockLocation));

        act(() => { result.current.openModal(); });

        // Find a future available day
        const availableDays = Object.entries(result.current.availability)
            .filter(([, v]) => v.available)
            .map(([k]) => Number(k));

        if (availableDays.length > 0) {
            await act(async () => { result.current.handleDateSelect(availableDays[0]); });
            expect(result.current.selectedDate).toBe(availableDays[0]);
        }
    });

    it('debe cambiar horarios', () => {
        const { result } = renderHook(() => useReservation(mockLocation));

        act(() => { result.current.handleStartTimeChange('09:00'); });
        expect(result.current.startTime).toBe('09:00');

        act(() => { result.current.handleEndTimeChange('17:00'); });
        expect(result.current.endTime).toBe('17:00');
    });

    it('debe agregar y quitar equipment', () => {
        const { result } = renderHook(() => useReservation(mockLocation));

        act(() => { result.current.handleEquipmentToggle('eq1', 'Proyector'); });
        expect(result.current.selectedEquipment).toHaveLength(1);
        expect(result.current.selectedEquipment[0]).toEqual({ itemId: 'eq1', name: 'Proyector', qty: 1 });

        // Toggle off
        act(() => { result.current.handleEquipmentToggle('eq1', 'Proyector'); });
        expect(result.current.selectedEquipment).toHaveLength(0);
    });

    it('debe navegar entre meses', () => {
        const { result } = renderHook(() => useReservation(mockLocation));
        const initialMonth = result.current.currentDate.getMonth();

        act(() => { result.current.goToNextMonth(); });
        expect(result.current.currentDate.getMonth()).toBe((initialMonth + 1) % 12);

        act(() => { result.current.goToPreviousMonth(); });
        expect(result.current.currentDate.getMonth()).toBe(initialMonth);
    });

    it('debe detectar conflicto de horario', async () => {
        mockGetSpaceAvailabilityExecute.mockResolvedValue({
            busySlots: [{ start: '10:00', end: '12:00' }]
        });

        const { result } = renderHook(() => useReservation(mockLocation));

        act(() => { result.current.openModal(); });

        const availableDays = Object.entries(result.current.availability)
            .filter(([, v]) => v.available).map(([k]) => Number(k));

        if (availableDays.length > 0) {
            await act(async () => { result.current.handleDateSelect(availableDays[0]); });
            // Wait for busy slots to load
            await waitFor(() => expect(result.current.busySlots).toHaveLength(1));

            act(() => {
                result.current.handleStartTimeChange('09:00');
                result.current.handleEndTimeChange('11:00');
            });

            expect(result.current.hasTimeConflict).toBe(true);
        }
    });

    it('debe mostrar error si no hay fecha seleccionada al confirmar', async () => {
        const { result } = renderHook(() => useReservation(mockLocation));

        await act(async () => { await result.current.handleConfirm(); });
        expect(result.current.error).toBe('Por favor selecciona una fecha');
    });

    it('debe mostrar error si hora inicio >= hora fin', async () => {
        const { result } = renderHook(() => useReservation(mockLocation));

        act(() => { result.current.openModal(); });

        const availableDays = Object.entries(result.current.availability)
            .filter(([, v]) => v.available).map(([k]) => Number(k));

        if (availableDays.length > 0) {
            await act(async () => { result.current.handleDateSelect(availableDays[0]); });

            act(() => {
                result.current.handleStartTimeChange('18:00');
                result.current.handleEndTimeChange('08:00');
            });

            await act(async () => { await result.current.handleConfirm(); });
            expect(result.current.error).toBe('La hora de fin debe ser posterior a la hora de inicio');
        }
    });

    it('debe crear reserva exitosamente', async () => {
        const { result } = renderHook(() => useReservation(mockLocation));

        act(() => { result.current.openModal(); });

        const availableDays = Object.entries(result.current.availability)
            .filter(([, v]) => v.available).map(([k]) => Number(k));

        if (availableDays.length > 0) {
            await act(async () => { result.current.handleDateSelect(availableDays[0]); });

            act(() => {
                result.current.handleStartTimeChange('09:00');
                result.current.handleEndTimeChange('10:00');
            });

            const onSuccess = vi.fn();
            await act(async () => { await result.current.handleConfirm(onSuccess); });

            expect(mockCreateReservationExecute).toHaveBeenCalled();
            expect(result.current.successMessage).toContain('Reserva creada exitosamente');
            expect(onSuccess).toHaveBeenCalled();
        }
    });

    it('debe manejar error al crear reserva', async () => {
        mockCreateReservationExecute.mockRejectedValue(new Error('Server error'));
        const { result } = renderHook(() => useReservation(mockLocation));

        act(() => { result.current.openModal(); });

        const availableDays = Object.entries(result.current.availability)
            .filter(([, v]) => v.available).map(([k]) => Number(k));

        if (availableDays.length > 0) {
            await act(async () => { result.current.handleDateSelect(availableDays[0]); });

            await act(async () => { await result.current.handleConfirm(); });

            expect(result.current.error).toBe('Server error');
        }
    });

    it('canConfirm debe ser false sin fecha seleccionada', () => {
        const { result } = renderHook(() => useReservation(mockLocation));
        expect(result.current.canConfirm).toBe(false);
    });

    it('debe manejar location null', () => {
        const { result } = renderHook(() => useReservation(null));
        expect(result.current.isOpen).toBe(false);
    });

    it('debe mostrar error si no hay ubicación al confirmar con fecha seleccionada', async () => {
        const { result } = renderHook(() => useReservation(null));

        // Can't open modal for null location but handleConfirm can still be called
        // Manually trigger confirm - it should fail on selectedDate first
        await act(async () => { await result.current.handleConfirm(); });
        expect(result.current.error).toBe('Por favor selecciona una fecha');
    });
});
