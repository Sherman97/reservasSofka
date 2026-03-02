import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReservationCard } from './ReservationCard';
import { Reservation } from '../../../core/domain/entities/Reservation';

// Mock the CSS import
vi.mock('../../styles/reservations/Reservations.css', () => ({}));

const futureDate = new Date(Date.now() + 86400000 * 7);
const pastDate = new Date(Date.now() - 86400000 * 7);

const createReservation = (overrides = {}) =>
    new Reservation({
        id: 'r1', userId: 'u1', locationId: 'l1', locationName: 'Sala Reuniones',
        startAt: futureDate.toISOString(),
        endAt: new Date(futureDate.getTime() + 3600000).toISOString(),
        status: 'active', equipment: [], ...overrides
    });

describe('ReservationCard', () => {
    const mockOnCancel = vi.fn();

    beforeEach(() => { vi.clearAllMocks(); });

    it('debe mostrar nombre de la ubicación', () => {
        render(<ReservationCard reservation={createReservation()} onCancel={mockOnCancel} />);
        expect(screen.getByText('Sala Reuniones')).toBeDefined();
    });

    it('debe mostrar ID de la reserva', () => {
        render(<ReservationCard reservation={createReservation()} onCancel={mockOnCancel} />);
        expect(screen.getByText('ID: r1')).toBeDefined();
    });

    it('debe mostrar estado "Próxima" para reservas futuras activas', () => {
        render(<ReservationCard reservation={createReservation()} onCancel={mockOnCancel} />);
        expect(screen.getByText('Próxima')).toBeDefined();
    });

    it('debe mostrar estado "Cancelada" para reservas canceladas', () => {
        render(<ReservationCard reservation={createReservation({ status: 'cancelled' })} onCancel={mockOnCancel} />);
        expect(screen.getByText('Cancelada')).toBeDefined();
    });

    it('debe mostrar estado "Pasada" para reservas pasadas activas', () => {
        const res = createReservation({
            status: 'active',
            startAt: pastDate.toISOString(),
            endAt: new Date(pastDate.getTime() + 3600000).toISOString()
        });
        render(<ReservationCard reservation={res} onCancel={mockOnCancel} />);
        expect(screen.getByText('Pasada')).toBeDefined();
    });

    it('debe mostrar botón cancelar solo para reservas upcoming', () => {
        const { container } = render(<ReservationCard reservation={createReservation()} onCancel={mockOnCancel} />);
        const cancelBtn = container.querySelector('.btn-cancel-res');
        expect(cancelBtn).not.toBeNull();
    });

    it('no debe mostrar botón cancelar para reservas canceladas', () => {
        const { container } = render(<ReservationCard reservation={createReservation({ status: 'cancelled' })} onCancel={mockOnCancel} />);
        const cancelBtn = container.querySelector('.btn-cancel-res');
        expect(cancelBtn).toBeNull();
    });

    it('debe llamar onCancel con el ID al hacer clic', () => {
        const { container } = render(<ReservationCard reservation={createReservation()} onCancel={mockOnCancel} />);
        const cancelBtn = container.querySelector('.btn-cancel-res');
        cancelBtn.click();
        expect(mockOnCancel).toHaveBeenCalledWith('r1');
    });

    it('debe usar icono de sala para nombres con "sala"', () => {
        const { container } = render(<ReservationCard reservation={createReservation()} onCancel={mockOnCancel} />);
        expect(container.querySelector('.card-icon').textContent).toBe('🏢');
    });

    it('debe usar icono por defecto para nombres genéricos', () => {
        const res = createReservation({ locationName: 'Espacio Coworking' });
        const { container } = render(<ReservationCard reservation={res} onCancel={mockOnCancel} />);
        expect(container.querySelector('.card-icon').textContent).toBe('📅');
    });

    // === Tests for deliver/return buttons and new statuses ===

    it('debe mostrar botón de entrega para reservas confirmed/active', () => {
        const mockOnDeliver = vi.fn();
        const res = createReservation({ status: 'active' });
        const { container } = render(
            <ReservationCard reservation={res} onCancel={mockOnCancel} onDeliver={mockOnDeliver} onReturn={vi.fn()} />
        );
        const deliverBtn = container.querySelector('.btn-deliver-res');
        expect(deliverBtn).not.toBeNull();
    });

    it('debe llamar onDeliver con la reserva al hacer clic en botón entrega', () => {
        const mockOnDeliver = vi.fn();
        const res = createReservation({ status: 'active' });
        const { container } = render(
            <ReservationCard reservation={res} onCancel={mockOnCancel} onDeliver={mockOnDeliver} onReturn={vi.fn()} />
        );
        container.querySelector('.btn-deliver-res').click();
        expect(mockOnDeliver).toHaveBeenCalledWith(res);
    });

    it('no debe mostrar botón de entrega para reservas canceladas', () => {
        const mockOnDeliver = vi.fn();
        const res = createReservation({ status: 'cancelled' });
        const { container } = render(
            <ReservationCard reservation={res} onCancel={mockOnCancel} onDeliver={mockOnDeliver} onReturn={vi.fn()} />
        );
        expect(container.querySelector('.btn-deliver-res')).toBeNull();
    });

    it('no debe mostrar botón de entrega para reservas completed', () => {
        const mockOnDeliver = vi.fn();
        const res = createReservation({ status: 'completed' });
        const { container } = render(
            <ReservationCard reservation={res} onCancel={mockOnCancel} onDeliver={mockOnDeliver} onReturn={vi.fn()} />
        );
        expect(container.querySelector('.btn-deliver-res')).toBeNull();
    });

    it('no debe mostrar botón de entrega si onDeliver no se pasa', () => {
        const res = createReservation({ status: 'active' });
        const { container } = render(
            <ReservationCard reservation={res} onCancel={mockOnCancel} />
        );
        expect(container.querySelector('.btn-deliver-res')).toBeNull();
    });

    it('debe mostrar botón de devolución para reservas in_progress', () => {
        const mockOnReturn = vi.fn();
        const res = createReservation({ status: 'in_progress' });
        const { container } = render(
            <ReservationCard reservation={res} onCancel={mockOnCancel} onDeliver={vi.fn()} onReturn={mockOnReturn} />
        );
        const returnBtn = container.querySelector('.btn-return-res');
        expect(returnBtn).not.toBeNull();
    });

    it('debe llamar onReturn con la reserva al hacer clic en botón devolución', () => {
        const mockOnReturn = vi.fn();
        const res = createReservation({ status: 'in_progress' });
        const { container } = render(
            <ReservationCard reservation={res} onCancel={mockOnCancel} onDeliver={vi.fn()} onReturn={mockOnReturn} />
        );
        container.querySelector('.btn-return-res').click();
        expect(mockOnReturn).toHaveBeenCalledWith(res);
    });

    it('no debe mostrar botón de devolución para reservas active', () => {
        const mockOnReturn = vi.fn();
        const res = createReservation({ status: 'active' });
        const { container } = render(
            <ReservationCard reservation={res} onCancel={mockOnCancel} onDeliver={vi.fn()} onReturn={mockOnReturn} />
        );
        expect(container.querySelector('.btn-return-res')).toBeNull();
    });

    it('no debe mostrar botón de devolución si onReturn no se pasa', () => {
        const res = createReservation({ status: 'in_progress' });
        const { container } = render(
            <ReservationCard reservation={res} onCancel={mockOnCancel} />
        );
        expect(container.querySelector('.btn-return-res')).toBeNull();
    });

    it('debe mostrar estado "En Progreso" para reservas in_progress', () => {
        render(<ReservationCard reservation={createReservation({ status: 'in_progress' })} onCancel={mockOnCancel} />);
        expect(screen.getByText('En Progreso')).toBeDefined();
    });

    it('debe aplicar clase res-status-in-progress para status in_progress', () => {
        const { container } = render(
            <ReservationCard reservation={createReservation({ status: 'in_progress' })} onCancel={mockOnCancel} />
        );
        expect(container.querySelector('.res-status-in-progress')).not.toBeNull();
    });

    it('debe mostrar estado "Completada" para reservas completed', () => {
        render(<ReservationCard reservation={createReservation({ status: 'completed' })} onCancel={mockOnCancel} />);
        expect(screen.getByText('Completada')).toBeDefined();
    });

    it('debe aplicar clase res-status-completed para status completed', () => {
        const { container } = render(
            <ReservationCard reservation={createReservation({ status: 'completed' })} onCancel={mockOnCancel} />
        );
        expect(container.querySelector('.res-status-completed')).not.toBeNull();
    });

    it('debe usar icono laptop para nombres con "laptop"', () => {
        const res = createReservation({ locationName: 'Laptop Dell XPS' });
        const { container } = render(<ReservationCard reservation={res} onCancel={mockOnCancel} />);
        expect(container.querySelector('.card-icon').textContent).toBe('💻');
    });

    it('debe usar icono cámara para nombres con "kit"', () => {
        const res = createReservation({ locationName: 'Kit de Video' });
        const { container } = render(<ReservationCard reservation={res} onCancel={mockOnCancel} />);
        expect(container.querySelector('.card-icon').textContent).toBe('📹');
    });
});
