import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReservationStatusFilter } from './ReservationStatusFilter';

describe('ReservationStatusFilter', () => {
    it('ReservationStatusFilter.renderiza_solo_estados_permitidos_hu01', () => {
        render(
            <ReservationStatusFilter
                value=""
                onChange={vi.fn()}
                label="Estado"
            />
        );

        const options = screen.getAllByRole('option').map((option) => option.textContent?.trim());
        expect(options).toEqual(['Pendiente', 'Confirmada', 'Cancelada', 'Finalizada']);
    });
});
