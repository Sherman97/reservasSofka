import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
    useAdminReservationFilters,
    ADMIN_RESERVATION_INVALID_RANGE_MESSAGE,
} from './useAdminReservationFilters';

describe('useAdminReservationFilters', () => {
    it('useAdminReservationFilters.no_aplica_si_rango_fechas_es_invalido', () => {
        const onApply = vi.fn();
        const { result } = renderHook(() => useAdminReservationFilters({ onApply }));

        act(() => {
            result.current.setFilter('from', '2026-06-10');
            result.current.setFilter('to', '2026-06-01');
        });

        act(() => {
            result.current.applyFilters();
        });

        expect(onApply).not.toHaveBeenCalled();
        expect(result.current.validationError).toBe(ADMIN_RESERVATION_INVALID_RANGE_MESSAGE);
    });
});
