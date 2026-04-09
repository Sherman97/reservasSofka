import React from 'react';

export const ReservationStatusFilter = ({
    value,
    onChange,
    label = 'Estado',
    includeEmptyOption = false,
}) => {
    return (
        <div className="filter-field">
            <label htmlFor="admin-reservation-status">{label}</label>
            <select
                id="admin-reservation-status"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                {includeEmptyOption && <option value="">Todos los estados</option>}
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Finalizada">Finalizada</option>
            </select>
        </div>
    );
};

export default ReservationStatusFilter;
