import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../core/adapters/hooks/useUserReservations', () => ({
    useUserReservations: vi.fn()
}));

vi.mock('../../../core/adapters/hooks/useReminderAlerts', () => ({
    useReminderAlerts: vi.fn(() => ({
        alerts: [],
        hasAlerts: false,
        dismissAlert: vi.fn(),
        clearAllAlerts: vi.fn()
    }))
}));

vi.mock('../../components/reservations/ReservationFilterBar', () => ({
    ReservationFilterBar: ({ activeTab, searchTerm, onTabChange, _onSearchChange }) => (
        <div data-testid="filter-bar">
            Tab: {activeTab} | Search: {searchTerm}
            <button data-testid="tab-past" onClick={() => onTabChange('past')}>Past</button>
        </div>
    )
}));

vi.mock('../../components/reservations/ReservationList', () => ({
    ReservationList: ({ reservations, onDeliver, onReturn }) => (
        <div data-testid="reservation-list">
            {reservations.length} reservations
            {onDeliver && <button data-testid="deliver-btn" onClick={() => onDeliver({ id: 'r1', locationName: 'Sala A' })}>Deliver</button>}
            {onReturn && <button data-testid="return-btn" onClick={() => onReturn({ id: 'r2', locationName: 'Sala B' })}>Return</button>}
        </div>
    )
}));

vi.mock('../../components/common/Pagination', () => ({
    Pagination: ({ onPageChange }) => (
        <div data-testid="pagination">
            <button data-testid="page-2" onClick={() => onPageChange(2)}>2</button>
        </div>
    )
}));

vi.mock('../../styles/reservations/Reservations.css', () => ({}));
vi.mock('../../styles/reservations/ReminderAlerts.css', () => ({}));

vi.mock('../../components/reservations/HandoverModal', () => ({
    HandoverModal: ({ isOpen, onClose, onConfirm, action, reservationName }) => (
        isOpen ? (
            <div data-testid="handover-modal">
                <span data-testid="modal-action">{action}</span>
                <span data-testid="modal-name">{reservationName}</span>
                <button data-testid="modal-confirm" onClick={() => onConfirm('test novelty')}>Confirm</button>
                <button data-testid="modal-close" onClick={onClose}>Close</button>
            </div>
        ) : null
    )
}));

vi.mock('../../components/reservations/ReminderAlertBanner', () => ({
    ReminderAlertBanner: ({ alerts, onDismiss, onClearAll }) => (
        alerts && alerts.length > 0 ? (
            <div data-testid="reminder-banner">
                {alerts.length} alerts
                <button data-testid="dismiss-alert" onClick={() => onDismiss(alerts[0].id)}>Dismiss</button>
                <button data-testid="clear-alerts" onClick={onClearAll}>Clear</button>
            </div>
        ) : null
    )
}));

import { MyReservationsPage } from './MyReservationsPage';
import { useUserReservations } from '../../../core/adapters/hooks/useUserReservations';
import { useReminderAlerts } from '../../../core/adapters/hooks/useReminderAlerts';

describe('MyReservationsPage', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('debe mostrar loading cuando loading=true', () => {
        useUserReservations.mockReturnValue({
            reservations: [], loading: true, error: null,
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation: vi.fn(), reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        expect(screen.getByText('Cargando tus reservas...')).toBeDefined();
    });

    it('debe mostrar error con botón reintentar', () => {
        useUserReservations.mockReturnValue({
            reservations: [], loading: false, error: 'Error al cargar',
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation: vi.fn(), reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        expect(screen.getByText(/Error al cargar/)).toBeDefined();
        expect(screen.getByText('Reintentar')).toBeDefined();
    });

    it('debe mostrar la lista de reservas', () => {
        useUserReservations.mockReturnValue({
            reservations: [{ id: 'r1' }, { id: 'r2' }],
            loading: false, error: null,
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation: vi.fn(), reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        expect(screen.getByTestId('reservation-list')).toBeDefined();
    });

    it('debe mostrar filter bar con tab activo', () => {
        useUserReservations.mockReturnValue({
            reservations: [], loading: false, error: null,
            searchTerm: 'test', activeTab: 'cancelled',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation: vi.fn(), reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        expect(screen.getByText('Tab: cancelled | Search: test')).toBeDefined();
    });

    it('debe mostrar paginación cuando hay más de 5 reservas', () => {
        const reservations = Array.from({ length: 7 }, (_, i) => ({ id: `r${i}` }));
        useUserReservations.mockReturnValue({
            reservations, loading: false, error: null,
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation: vi.fn(), reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        expect(screen.getByTestId('pagination')).toBeDefined();
    });

    it('debe cambiar de página con handlePageChange', () => {
        const scrollToSpy = vi.fn();
        window.scrollTo = scrollToSpy;
        const reservations = Array.from({ length: 7 }, (_, i) => ({ id: `r${i}` }));
        useUserReservations.mockReturnValue({
            reservations, loading: false, error: null,
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation: vi.fn(), reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        fireEvent.click(screen.getByTestId('page-2'));
        expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('debe resetear página al cambiar tab', () => {
        const setActiveTab = vi.fn();
        const reservations = Array.from({ length: 7 }, (_, i) => ({ id: `r${i}` }));
        useUserReservations.mockReturnValue({
            reservations, loading: false, error: null,
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab, handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation: vi.fn(), reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        fireEvent.click(screen.getByTestId('tab-past'));
        expect(setActiveTab).toHaveBeenCalledWith('past');
    });

    // === Tests for handover modal flow ===

    it('debe abrir modal de entrega al hacer clic en deliver', () => {
        useUserReservations.mockReturnValue({
            reservations: [{ id: 'r1' }], loading: false, error: null,
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation: vi.fn(), reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        fireEvent.click(screen.getByTestId('deliver-btn'));

        expect(screen.getByTestId('handover-modal')).toBeDefined();
        expect(screen.getByTestId('modal-action').textContent).toBe('deliver');
        expect(screen.getByTestId('modal-name').textContent).toBe('Sala A');
    });

    it('debe abrir modal de devolución al hacer clic en return', () => {
        useUserReservations.mockReturnValue({
            reservations: [{ id: 'r1' }], loading: false, error: null,
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation: vi.fn(), reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        fireEvent.click(screen.getByTestId('return-btn'));

        expect(screen.getByTestId('handover-modal')).toBeDefined();
        expect(screen.getByTestId('modal-action').textContent).toBe('return');
        expect(screen.getByTestId('modal-name').textContent).toBe('Sala B');
    });

    it('debe cerrar modal al hacer clic en Close', () => {
        useUserReservations.mockReturnValue({
            reservations: [{ id: 'r1' }], loading: false, error: null,
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation: vi.fn(), reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        fireEvent.click(screen.getByTestId('deliver-btn'));
        expect(screen.getByTestId('handover-modal')).toBeDefined();

        fireEvent.click(screen.getByTestId('modal-close'));
        expect(screen.queryByTestId('handover-modal')).toBeNull();
    });

    it('debe llamar deliverReservation al confirmar modal deliver', async () => {
        const deliverReservation = vi.fn().mockResolvedValue(undefined);
        useUserReservations.mockReturnValue({
            reservations: [{ id: 'r1' }], loading: false, error: null,
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation, returnReservation: vi.fn(), reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        fireEvent.click(screen.getByTestId('deliver-btn'));
        fireEvent.click(screen.getByTestId('modal-confirm'));

        await waitFor(() => {
            expect(deliverReservation).toHaveBeenCalledWith('r1', 'test novelty');
        });
    });

    it('debe llamar returnReservation al confirmar modal return', async () => {
        const returnReservation = vi.fn().mockResolvedValue(undefined);
        useUserReservations.mockReturnValue({
            reservations: [{ id: 'r1' }], loading: false, error: null,
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation, reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        fireEvent.click(screen.getByTestId('return-btn'));
        fireEvent.click(screen.getByTestId('modal-confirm'));

        await waitFor(() => {
            expect(returnReservation).toHaveBeenCalledWith('r2', 'test novelty');
        });
    });

    // === Tests for reminder alerts ===

    it('debe mostrar banner de recordatorios cuando hay alertas', () => {
        useReminderAlerts.mockReturnValue({
            alerts: [{ id: 'a1', reservationId: 1, type: 'reminder_15m', message: 'test' }],
            hasAlerts: true,
            dismissAlert: vi.fn(),
            clearAllAlerts: vi.fn()
        });

        useUserReservations.mockReturnValue({
            reservations: [], loading: false, error: null,
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation: vi.fn(), reload: vi.fn()
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        expect(screen.getByTestId('reminder-banner')).toBeDefined();
    });

    it('debe llamar reload cuando se hace clic en Reintentar', () => {
        const reload = vi.fn();
        useUserReservations.mockReturnValue({
            reservations: [], loading: false, error: 'Error de red',
            searchTerm: '', activeTab: 'upcoming',
            setActiveTab: vi.fn(), handleSearch: vi.fn(),
            cancelReservation: vi.fn(), deliverReservation: vi.fn(), returnReservation: vi.fn(), reload
        });

        render(<MemoryRouter><MyReservationsPage /></MemoryRouter>);
        fireEvent.click(screen.getByText('Reintentar'));
        expect(reload).toHaveBeenCalled();
    });
});
