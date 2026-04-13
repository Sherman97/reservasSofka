import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from './Calendar';

describe('Calendar', () => {
    const defaultProps = {
        currentDate: new Date(2026, 5, 1), // June 2026 (future)
        selectedDate: null,
        availability: {},
        onDateSelect: vi.fn(),
        onPreviousMonth: vi.fn(),
        onNextMonth: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Generate availability for all days
        const avail = {};
        for (let i = 1; i <= 30; i++) {
            avail[i] = { available: true, busySlots: [] };
        }
        defaultProps.availability = avail;
    });

    it('debe mostrar el mes y año correctos', () => {
        render(<Calendar {...defaultProps} />);
        expect(screen.getByText('Junio 2026')).toBeDefined();
    });

    it('debe renderizar los días del mes', () => {
        render(<Calendar {...defaultProps} />);
        // June has 30 days
        expect(screen.getByText('1')).toBeDefined();
        expect(screen.getByText('30')).toBeDefined();
    });

    it('debe navegar al mes anterior', () => {
        render(<Calendar {...defaultProps} />);
        fireEvent.click(screen.getByText('←'));
        expect(defaultProps.onPreviousMonth).toHaveBeenCalled();
    });

    it('debe navegar al mes siguiente', () => {
        render(<Calendar {...defaultProps} />);
        fireEvent.click(screen.getByText('→'));
        expect(defaultProps.onNextMonth).toHaveBeenCalled();
    });

    it('debe llamar onDateSelect al hacer clic en un día futuro', () => {
        render(<Calendar {...defaultProps} />);
        // Click on day 25 (should be future for June 2025 if we run before that)
        fireEvent.click(screen.getByText('25'));
        expect(defaultProps.onDateSelect).toHaveBeenCalledWith(25);
    });

    it('debe marcar el día seleccionado', () => {
        render(<Calendar {...{ ...defaultProps, selectedDate: 15 }} />);
        const day15 = screen.getByText('15');
        expect(day15.className).toContain('selected');
    });

    it('debe mostrar los nombres de los días de la semana', () => {
        render(<Calendar {...defaultProps} />);
        expect(screen.getByText('Dom')).toBeDefined();
        expect(screen.getByText('Lun')).toBeDefined();
    });
});
