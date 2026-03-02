import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserReservations } from './useUserReservations';
import { Reservation } from '../../../core/domain/entities/Reservation';

const mockGetUserReservationsExecute = vi.fn();
const mockCancelReservationExecute = vi.fn();
const mockGetCurrentUserExecute = vi.fn();
const mockDeliverReservationExecute = vi.fn();
const mockReturnReservationExecute = vi.fn();

vi.mock('../providers/DependencyProvider', () => ({
    useReservationDependencies: () => ({
        getUserReservationsUseCase: { execute: mockGetUserReservationsExecute },
        cancelReservationUseCase: { execute: mockCancelReservationExecute },
        deliverReservationUseCase: { execute: mockDeliverReservationExecute },
        returnReservationUseCase: { execute: mockReturnReservationExecute }
    }),
    useAuthDependencies: () => ({
        getCurrentUserUseCase: { execute: mockGetCurrentUserExecute }
    })
}));

const futureDate = new Date(Date.now() + 86400000 * 7); // 7 days from now
const pastDate = new Date(Date.now() - 86400000 * 7); // 7 days ago

const createReservation = (overrides: Partial<import('../../../core/domain/entities/Reservation').ReservationProps> = {}) =>
    new Reservation({
        id: 'r1', userId: 'u1', locationId: 'l1', locationName: 'Sala A',
        startAt: futureDate.toISOString(),
        endAt: new Date(futureDate.getTime() + 3600000).toISOString(),
        status: 'active', equipment: [], ...overrides
    });

describe('useUserReservations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockGetCurrentUserExecute.mockReturnValue({ id: 'u1', name: 'Test', email: 'a@b.com' });
        mockGetUserReservationsExecute.mockResolvedValue([createReservation()]);
        mockCancelReservationExecute.mockResolvedValue(undefined);
        mockDeliverReservationExecute.mockResolvedValue(undefined);
        mockReturnReservationExecute.mockResolvedValue(undefined);
    });

    afterEach(() => { vi.restoreAllMocks(); });

    it('debe iniciar en estado loading', () => {
        const { result } = renderHook(() => useUserReservations());
        expect(result.current.loading).toBe(true);
    });

    it('debe cargar reservas del usuario', async () => {
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.allReservations).toHaveLength(1);
        expect(mockGetCurrentUserExecute).toHaveBeenCalled();
        expect(mockGetUserReservationsExecute).toHaveBeenCalledWith('u1');
    });

    it('debe mostrar error si usuario no autenticado', async () => {
        mockGetCurrentUserExecute.mockReturnValue(null);
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Usuario no autenticado');
    });

    it('debe filtrar por tab upcoming (default)', async () => {
        const upcomingRes = createReservation({ id: 'r1', status: 'active' });
        const pastRes = createReservation({
            id: 'r2', status: 'active',
            startAt: pastDate.toISOString(),
            endAt: new Date(pastDate.getTime() + 3600000).toISOString()
        });
        const cancelledRes = createReservation({ id: 'r3', status: 'cancelled' });

        mockGetUserReservationsExecute.mockResolvedValue([upcomingRes, pastRes, cancelledRes]);
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.activeTab).toBe('upcoming');
        // Only upcoming (active + future) should show
        expect(result.current.reservations.every(r => r.isUpcoming())).toBe(true);
    });

    it('debe cambiar a tab cancelled', async () => {
        const upcomingRes = createReservation({ id: 'r1', status: 'active' });
        const cancelledRes = createReservation({ id: 'r3', status: 'cancelled' });

        mockGetUserReservationsExecute.mockResolvedValue([upcomingRes, cancelledRes]);
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => { result.current.setActiveTab('cancelled'); });

        expect(result.current.reservations.every(r => r.isCancelled())).toBe(true);
    });

    it('debe filtrar por búsqueda', async () => {
        const res1 = createReservation({ id: 'r1', locationName: 'Sala A' });
        const res2 = createReservation({ id: 'r2', locationName: 'Sala B' });
        mockGetUserReservationsExecute.mockResolvedValue([res1, res2]);

        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => { result.current.handleSearch('Sala B'); });

        expect(result.current.reservations).toHaveLength(1);
        expect(result.current.reservations[0].locationName).toBe('Sala B');
    });

    it('debe cancelar una reserva con confirmación', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => { await result.current.cancelReservation('r1'); });

        expect(mockCancelReservationExecute).toHaveBeenCalledWith('r1');
        // After cancel, it reloads reservations
        const totalCalls = mockGetUserReservationsExecute.mock.calls.length;
        expect(totalCalls).toBeGreaterThanOrEqual(2);
    });

    it('no debe cancelar si usuario no confirma', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false);
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => { await result.current.cancelReservation('r1'); });

        expect(mockCancelReservationExecute).not.toHaveBeenCalled();
    });

    it('debe manejar error de carga', async () => {
        mockGetUserReservationsExecute.mockRejectedValue(new Error('Server error'));
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Server error');
    });

    it('debe manejar error al cancelar', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        mockCancelReservationExecute.mockRejectedValue(new Error('Cancel failed'));

        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => { await result.current.cancelReservation('r1'); });

        expect(window.alert).toHaveBeenCalledWith('Cancel failed');
    });

    it('reload debe recargar reservas', async () => {
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        const callsBefore = mockGetUserReservationsExecute.mock.calls.length;
        await act(async () => { await result.current.reload(); });
        expect(mockGetUserReservationsExecute).toHaveBeenCalledTimes(callsBefore + 1);
    });

    // === Tests for deliver/return functionality ===

    it('debe entregar una reserva exitosamente', async () => {
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => { await result.current.deliverReservation('r1', 'Sin novedad'); });

        expect(mockDeliverReservationExecute).toHaveBeenCalledWith('r1', 'Sin novedad');
        // Should reload reservations after delivering
        expect(mockGetUserReservationsExecute.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('debe entregar una reserva sin novedad', async () => {
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => { await result.current.deliverReservation('r1'); });

        expect(mockDeliverReservationExecute).toHaveBeenCalledWith('r1', undefined);
    });

    it('debe manejar error al entregar reserva', async () => {
        mockDeliverReservationExecute.mockRejectedValue(new Error('Deliver failed'));

        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => { result.current.deliverReservation('r1'); });

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith(
                'Error delivering reservation:',
                expect.objectContaining({ message: 'Deliver failed' })
            );
        });
    });

    it('debe devolver una reserva exitosamente', async () => {
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => { await result.current.returnReservation('r1', 'Todo OK'); });

        expect(mockReturnReservationExecute).toHaveBeenCalledWith('r1', 'Todo OK');
        expect(mockGetUserReservationsExecute.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('debe devolver una reserva sin novedad', async () => {
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => { await result.current.returnReservation('r1'); });

        expect(mockReturnReservationExecute).toHaveBeenCalledWith('r1', undefined);
    });

    it('debe manejar error al devolver reserva', async () => {
        mockReturnReservationExecute.mockRejectedValue(new Error('Return failed'));

        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => { result.current.returnReservation('r1'); });

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith(
                'Error returning reservation:',
                expect.objectContaining({ message: 'Return failed' })
            );
        });
    });

    it('debe filtrar reservas in_progress como upcoming', async () => {
        const inProgressRes = createReservation({ id: 'r-ip', status: 'in_progress' });
        const cancelledRes = createReservation({ id: 'r-c', status: 'cancelled' });
        mockGetUserReservationsExecute.mockResolvedValue([inProgressRes, cancelledRes]);

        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.activeTab).toBe('upcoming');
        expect(result.current.reservations.some(r => r.id === 'r-ip')).toBe(true);
        expect(result.current.reservations.some(r => r.id === 'r-c')).toBe(false);
    });

    it('debe filtrar reservas completed como past', async () => {
        const completedRes = createReservation({ id: 'r-comp', status: 'completed' });
        const activeRes = createReservation({ id: 'r-act', status: 'active' });
        mockGetUserReservationsExecute.mockResolvedValue([completedRes, activeRes]);

        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => { result.current.setActiveTab('past'); });

        expect(result.current.reservations.some(r => r.id === 'r-comp')).toBe(true);
    });

    it('debe filtrar reservas past+active en tab past', async () => {
        const pastActiveRes = createReservation({
            id: 'r-past', status: 'active',
            startAt: pastDate.toISOString(),
            endAt: new Date(pastDate.getTime() + 3600000).toISOString()
        });
        const futureActiveRes = createReservation({ id: 'r-future', status: 'active' });
        mockGetUserReservationsExecute.mockResolvedValue([pastActiveRes, futureActiveRes]);

        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => { result.current.setActiveTab('past'); });

        expect(result.current.reservations.some(r => r.id === 'r-past')).toBe(true);
        expect(result.current.reservations.some(r => r.id === 'r-future')).toBe(false);
    });

    it('debe filtrar reservas in_progress pasadas en upcoming', async () => {
        const pastInProgress = createReservation({
            id: 'r-pip', status: 'in_progress',
            startAt: pastDate.toISOString(),
            endAt: new Date(pastDate.getTime() + 3600000).toISOString()
        });
        mockGetUserReservationsExecute.mockResolvedValue([pastInProgress]);

        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // in_progress should be in upcoming even if past (isInProgress branch)
        expect(result.current.reservations.some(r => r.id === 'r-pip')).toBe(true);
    });

    it('debe buscar por ID de reserva', async () => {
        const res1 = createReservation({ id: 'abc-123', locationName: 'Sala A' });
        const res2 = createReservation({ id: 'def-456', locationName: 'Sala B' });
        mockGetUserReservationsExecute.mockResolvedValue([res1, res2]);

        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => { result.current.handleSearch('abc-123'); });

        expect(result.current.reservations).toHaveLength(1);
        expect(result.current.reservations[0].id).toBe('abc-123');
    });

    it('debe manejar error de carga con mensaje genérico', async () => {
        mockGetUserReservationsExecute.mockRejectedValue({ message: '' });
        const { result } = renderHook(() => useUserReservations());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Error al cargar las reservas');
    });
});
