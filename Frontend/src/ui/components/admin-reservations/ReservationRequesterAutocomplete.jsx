import React from 'react';

export const ReservationRequesterAutocomplete = ({
    id = 'admin-user-requester',
    label = 'Usuario solicitante',
    value,
    onSearch,
    onSelectUser,
    suggestions = [],
}) => {
    return (
        <div className="admin-form-field admin-autocomplete">
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                type="text"
                value={value}
                placeholder="Escriba nombre, apellido o correo"
                onChange={(event) => onSearch?.(event.target.value)}
            />

            {suggestions.length > 0 && (
                <div
                    role="listbox"
                    aria-label="Sugerencias de usuario"
                    className="admin-autocomplete-list"
                >
                    {suggestions.map((user) => (
                        <button
                            key={user.id}
                            type="button"
                            className="admin-autocomplete-item"
                            onClick={() => onSelectUser?.(user)}
                        >
                            {user.fullName || user.email}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReservationRequesterAutocomplete;
