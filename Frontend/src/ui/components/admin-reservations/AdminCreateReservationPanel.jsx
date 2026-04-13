import React, { useMemo, useState } from 'react';
import { ReservationRequesterAutocomplete } from './ReservationRequesterAutocomplete';
import { Calendar } from '../dashboard/modal/Calendar';
import { DurationSelector } from '../dashboard/modal/DurationSelector';
import '../../styles/dashboard/ReservationModal.css';
import '../../styles/admin/AdminReservations.css';

export const CREATE_RESERVATION_CONFLICT_MESSAGE =
    'El espacio seleccionado ya se encuentra reservado en este horario';

export const CREATE_RESERVATION_SUCCESS_MESSAGE = 'Reserva creada exitosamente';

const FALLBACK_CITY_OPTIONS = [
    { value: '1', label: 'Sede Medellin' },
    { value: '2', label: 'Sede Bogota' },
];

const FALLBACK_SPACE_OPTIONS = [
    { value: '101', label: 'Sala de Innovacion A1' },
    { value: '102', label: 'Auditorio Principal' },
];

const InlineFieldError = ({ message }) => (message ? <p className="admin-field-error">{message}</p> : null);

const getDateFromForm = (value) => {
    if (!value) return new Date();
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const buildAvailability = (currentDate) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const availability = {};

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
        availability[day] = { available: !isPast, busySlots: [] };
    }

    return availability;
};

export const AdminCreateReservationPanel = ({
    isOpen,
    mode = 'create',
    isAdmin = true,
    readOnly = false,
    title = 'Nueva Reserva',
    subtitle = 'Completa los datos para crear una reserva manual.',
    form,
    errors,
    hasConflict,
    canSubmit,
    successMessage,
    userSuggestions,
    onUserSearch,
    onUserSelect,
    onFieldChange,
    cityOptions = FALLBACK_CITY_OPTIONS,
    spaceOptions = FALLBACK_SPACE_OPTIONS,
    loadingCities = false,
    loadingSpaces = false,
    selectedEquipment = [],
    attendeesCount = 1,
    onAttendeesCountChange,
    onEquipmentToggle,
    equipmentOptions = [],
    loadingEquipment = false,
    onSubmit,
    onClose,
}) => {
    const [monthCursor, setMonthCursor] = useState(() => getDateFromForm(form.date));

    const resolvedCityOptions = cityOptions.length > 0 ? cityOptions : FALLBACK_CITY_OPTIONS;
    const resolvedSpaceOptions = spaceOptions.length > 0 ? spaceOptions : FALLBACK_SPACE_OPTIONS;
    const selectedDate = form.date
        ? getDateFromForm(form.date).getDate()
        : null;
    const calendarDate = useMemo(() => {
        if (form.date) {
            const selected = getDateFromForm(form.date);
            return new Date(selected.getFullYear(), selected.getMonth(), 1);
        }
        return new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    }, [form.date, monthCursor]);
    const availability = useMemo(() => buildAvailability(calendarDate), [calendarDate]);

    if (!isOpen) {
        return null;
    }

    const handleDateSelect = (day) => {
        const year = calendarDate.getFullYear();
        const month = String(calendarDate.getMonth() + 1).padStart(2, '0');
        const dayString = String(day).padStart(2, '0');
        onFieldChange('date', `${year}-${month}-${dayString}`);
    };

    const selectedEquipmentIds = selectedEquipment.map((item) => item.itemId);
    const isCreateMode = mode === 'create';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <section
                aria-label={isCreateMode ? 'Crear reserva manual' : 'Detalle de reserva'}
                className="modal-content admin-create-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <button type="button" className="modal-close" onClick={onClose}>X</button>
                <div className="modal-header admin-create-modal-header">
                    <div className="modal-item-details">
                        <h2>{title}</h2>
                        <p className="admin-create-subtitle">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="modal-body">
                        <div className="admin-create-grid admin-admin-fields">
                            {isAdmin && (
                                <div className="admin-form-field admin-field-full">
                                    {readOnly ? (
                                        <>
                                            <label htmlFor="admin-detail-requester">Usuario</label>
                                            <input
                                                id="admin-detail-requester"
                                                type="text"
                                                value={form.requesterQuery || ''}
                                                disabled
                                            />
                                        </>
                                    ) : (
                                        <ReservationRequesterAutocomplete
                                            value={form.requesterQuery}
                                            onSearch={onUserSearch}
                                            onSelectUser={onUserSelect}
                                            suggestions={userSuggestions}
                                        />
                                    )}
                                    <InlineFieldError message={errors.userId} />
                                </div>
                            )}

                            <div className="admin-form-field">
                                <label htmlFor="admin-create-site">Ciudad / Sede</label>
                                <select
                                    id="admin-create-site"
                                    value={form.site}
                                    disabled={readOnly}
                                    onChange={(event) => onFieldChange('site', event.target.value)}
                                >
                                    <option value="">{loadingCities ? 'Cargando ciudades...' : 'Seleccione una ciudad'}</option>
                                    {resolvedCityOptions.map((siteOption) => (
                                        <option key={siteOption.value} value={siteOption.value}>
                                            {siteOption.label}
                                        </option>
                                    ))}
                                </select>
                                <InlineFieldError message={errors.site} />
                            </div>

                            <div className="admin-form-field">
                                <label htmlFor="admin-create-space">Espacio / Sala</label>
                                <select
                                    id="admin-create-space"
                                    value={form.space}
                                    disabled={readOnly || !form.site}
                                    onChange={(event) => onFieldChange('space', event.target.value)}
                                >
                                    <option value="">
                                        {!form.site
                                            ? 'Seleccione primero una ciudad'
                                            : loadingSpaces
                                                ? 'Cargando espacios...'
                                                : 'Seleccione un espacio'}
                                    </option>
                                    {resolvedSpaceOptions.map((spaceOption) => (
                                        <option key={spaceOption.value} value={spaceOption.value}>
                                            {spaceOption.label}
                                        </option>
                                    ))}
                                </select>
                                <InlineFieldError message={errors.space} />
                            </div>
                        </div>

                        <div className="modal-columns admin-modal-columns">
                            <div className="modal-left-column">
                                <div className="modal-section">
                                    <h3>Selecciona una fecha</h3>
                                    <Calendar
                                        currentDate={calendarDate}
                                        selectedDate={selectedDate}
                                        availability={availability}
                                        onDateSelect={readOnly ? () => {} : handleDateSelect}
                                        onPreviousMonth={() => {
                                            setMonthCursor(
                                                new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1),
                                            );
                                        }}
                                        onNextMonth={() => {
                                            setMonthCursor(
                                                new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1),
                                            );
                                        }}
                                    />
                                    <InlineFieldError message={errors.date} />
                                </div>
                            </div>

                            <div className="modal-right-column">
                                <div className="modal-section">
                                    <h3>Horario de reserva</h3>
                                    <DurationSelector
                                        startTime={form.startTime}
                                        endTime={form.endTime}
                                        onStartTimeChange={readOnly ? () => {} : (value) => onFieldChange('startTime', value)}
                                        onEndTimeChange={readOnly ? () => {} : (value) => onFieldChange('endTime', value)}
                                        busySlots={[]}
                                        loadingSlots={false}
                                        hasTimeConflict={hasConflict}
                                        selectedDate={selectedDate}
                                        slotsUpdatedFlag={false}
                                        successMessage={successMessage}
                                    />
                                    <InlineFieldError message={errors.startTime} />
                                    <InlineFieldError message={errors.endTime} />
                                </div>

                                <div className="modal-section">
                                    <h3>Asistentes</h3>
                                    <div className="modal-section-attendees">
                                        <label className="modal-attendees-label" htmlFor="admin-create-attendees">
                                            Cantidad
                                        </label>
                                        <input
                                            id="admin-create-attendees"
                                            type="number"
                                            min="1"
                                            value={attendeesCount}
                                            disabled={readOnly}
                                            onChange={(event) => {
                                                onAttendeesCountChange?.(Number(event.target.value));
                                            }}
                                            className="modal-attendees-input"
                                        />
                                        <InlineFieldError message={errors.attendeesCount} />
                                    </div>
                                </div>

                                <div className="modal-section">
                                    <h3>Equipos adicionales</h3>
                                    <div className="admin-equipment-list">
                                        {!form.site && (
                                            <p className="admin-equipment-empty">Selecciona una ciudad para ver equipos.</p>
                                        )}
                                        {form.site && loadingEquipment && (
                                            <p className="admin-equipment-empty">Cargando equipos...</p>
                                        )}
                                        {form.site && !loadingEquipment && equipmentOptions.length === 0 && (
                                            <p className="admin-equipment-empty">No hay equipos disponibles en esta ciudad.</p>
                                        )}
                                        {form.site && !loadingEquipment && equipmentOptions.length > 0 && (
                                            <div className="admin-equipment-grid">
                                                {equipmentOptions.map((equipment) => {
                                                    const checked = selectedEquipmentIds.includes(equipment.id);
                                                    return (
                                                        <label
                                                            key={equipment.id}
                                                            className={`admin-equipment-item ${checked ? 'selected' : ''}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                disabled={readOnly || equipment.available === false}
                                                                onChange={() => onEquipmentToggle?.(equipment.id, equipment.name)}
                                                            />
                                                            <span>{equipment.name}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {hasConflict && (
                            <div className="modal-error-banner">
                                <span className="error-icon">!</span>
                                <span>{CREATE_RESERVATION_CONFLICT_MESSAGE}</span>
                            </div>
                        )}
                        {successMessage && (
                            <div className="modal-success-banner">
                                <span className="success-icon">OK</span>
                                <span>{successMessage}</span>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>{isCreateMode ? 'Cancelar' : 'Cerrar'}</button>
                        {isCreateMode && (
                            <button type="submit" className="btn-confirm" disabled={!canSubmit}>Crear Reserva</button>
                        )}
                    </div>
                </form>
            </section>
        </div>
    );
};

export default AdminCreateReservationPanel;
