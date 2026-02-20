import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReservationFilterBar } from './ReservationFilterBar';

describe('ReservationFilterBar', () => {
    const defaultProps = {
        activeTab: 'upcoming',
        onTabChange: vi.fn(),
        searchTerm: '',
        onSearchChange: vi.fn(),
    };

    it('should render all three filter tabs', () => {
        render(<ReservationFilterBar {...defaultProps} />);
        expect(screen.getByText('Próximas')).toBeInTheDocument();
        expect(screen.getByText('Pasadas')).toBeInTheDocument();
        expect(screen.getByText('Canceladas')).toBeInTheDocument();
    });

    it('should apply active class to the active tab', () => {
        render(<ReservationFilterBar {...defaultProps} activeTab="past" />);
        expect(screen.getByText('Pasadas').className).toContain('active');
        expect(screen.getByText('Próximas').className).not.toContain('active');
    });

    it('should call onTabChange when clicking a tab', () => {
        const onTabChange = vi.fn();
        render(<ReservationFilterBar {...defaultProps} onTabChange={onTabChange} />);

        fireEvent.click(screen.getByText('Canceladas'));
        expect(onTabChange).toHaveBeenCalledWith('cancelled');
    });

    it('should render search input', () => {
        render(<ReservationFilterBar {...defaultProps} />);
        expect(screen.getByPlaceholderText(/buscar por lugar o id/i)).toBeInTheDocument();
    });

    it('should display current search term', () => {
        render(<ReservationFilterBar {...defaultProps} searchTerm="Sala A" />);
        expect(screen.getByDisplayValue('Sala A')).toBeInTheDocument();
    });

    it('should call onSearchChange on input change', () => {
        const onSearchChange = vi.fn();
        render(<ReservationFilterBar {...defaultProps} onSearchChange={onSearchChange} />);

        fireEvent.change(screen.getByPlaceholderText(/buscar por lugar o id/i), {
            target: { value: 'Sala B' },
        });

        expect(onSearchChange).toHaveBeenCalledWith('Sala B');
    });
});
