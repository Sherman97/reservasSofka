import { useState } from 'react';

export interface AdminReservationFilters {
    from: string;
    to: string;
    status: string;
    site: string;
    user: string;
}

interface UseAdminReservationFiltersParams {
    onApply?: (filters: AdminReservationFilters) => void;
}

interface UseAdminReservationFiltersReturn {
    filters: AdminReservationFilters;
    validationError: string | null;
    setFilter: (name: keyof AdminReservationFilters, value: string) => void;
    applyFilters: () => void;
    clearFilters: () => void;
}

export const ADMIN_RESERVATION_DEFAULT_FILTERS: AdminReservationFilters = {
    from: '',
    to: '',
    status: '',
    site: '',
    user: '',
};

export const ADMIN_RESERVATION_INVALID_RANGE_MESSAGE = 'La fecha desde no puede ser mayor que la fecha hasta';

export const useAdminReservationFilters = ({ onApply }: UseAdminReservationFiltersParams = {}): UseAdminReservationFiltersReturn => {
    const [filters, setFilters] = useState<AdminReservationFilters>(ADMIN_RESERVATION_DEFAULT_FILTERS);
    const [validationError, setValidationError] = useState<string | null>(null);

    const setFilter = (name: keyof AdminReservationFilters, value: string): void => {
        setFilters((prev) => ({ ...prev, [name]: value }));
        setValidationError(null);
    };

    const applyFilters = (): void => {
        if (filters.from && filters.to && filters.from > filters.to) {
            setValidationError(ADMIN_RESERVATION_INVALID_RANGE_MESSAGE);
            return;
        }

        setValidationError(null);
        onApply?.(filters);
    };

    const clearFilters = (): void => {
        setFilters(ADMIN_RESERVATION_DEFAULT_FILTERS);
        setValidationError(null);
        onApply?.(ADMIN_RESERVATION_DEFAULT_FILTERS);
    };

    return {
        filters,
        validationError,
        setFilter,
        applyFilters,
        clearFilters,
    };
};

export default useAdminReservationFilters;
