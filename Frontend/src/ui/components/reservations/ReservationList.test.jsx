import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReservationList } from './ReservationList';

// Mock ReservationCard to avoid coupling with domain entity methods
vi.mock('./ReservationCard', () => ({
    ReservationCard: ({ reservation }) => (
        <div data-testid={`card-${reservation.id}`}>{reservation.locationName}</div>
    ),
}));

describe('ReservationList', () => {
    it('should render empty state when no reservations', () => {
        render(<ReservationList reservations={[]} onCancel={vi.fn()} />);
        expect(screen.getByText(/no se encontraron reservaciones/i)).toBeInTheDocument();
    });

    it('should render empty state when reservations is undefined', () => {
        render(<ReservationList onCancel={vi.fn()} />);
        expect(screen.getByText(/no se encontraron reservaciones/i)).toBeInTheDocument();
    });

    it('should render reservation cards for each reservation', () => {
        const reservations = [
            { id: 'r1', locationName: 'Sala A' },
            { id: 'r2', locationName: 'Sala B' },
            { id: 'r3', locationName: 'Sala C' },
        ];

        render(<ReservationList reservations={reservations} onCancel={vi.fn()} />);

        expect(screen.getByTestId('card-r1')).toBeInTheDocument();
        expect(screen.getByTestId('card-r2')).toBeInTheDocument();
        expect(screen.getByTestId('card-r3')).toBeInTheDocument();
    });

    it('should display correct location names', () => {
        const reservations = [
            { id: 'r1', locationName: 'Sala Principal' },
        ];

        render(<ReservationList reservations={reservations} onCancel={vi.fn()} />);
        expect(screen.getByText('Sala Principal')).toBeInTheDocument();
    });
});
