import React, { useMemo } from 'react';

/**
 * Generate 1-hour time slot blocks for the timeline (08:00 - 18:00)
 */
const HOURS = Array.from({ length: 10 }, (_, i) => {
    const h = (8 + i).toString().padStart(2, '0');
    return { start: `${h}:00`, end: `${(9 + i).toString().padStart(2, '0')}:00`, label: `${h}:00` };
});

/**
 * Check if a time slot overlaps with any busy slot
 */
const isSlotBusy = (slotStart, slotEnd, busySlots) => {
    return busySlots.some(busy => slotStart < busy.end && slotEnd > busy.start);
};

/**
 * Check if a time slot overlaps with the user's selected range
 */
const isSlotSelected = (slotStart, slotEnd, startTime, endTime) => {
    if (!startTime || !endTime || startTime >= endTime) return false;
    return slotStart < endTime && slotEnd > startTime;
};

/**
 * Check if a time slot has a conflict (selected AND busy)
 */
const isSlotConflict = (slotStart, slotEnd, startTime, endTime, busySlots) => {
    return isSlotBusy(slotStart, slotEnd, busySlots) && isSlotSelected(slotStart, slotEnd, startTime, endTime);
};

export const DurationSelector = ({
    startTime,
    endTime,
    onStartTimeChange,
    onEndTimeChange,
    busySlots = [],
    loadingSlots = false,
    hasTimeConflict = false,
    selectedDate = null,
    slotsUpdatedFlag = false
}) => {
    const hasBusySlots = busySlots.length > 0;

    return (
        <div className="duration-selector">

            <div className="time-range-inputs">
                <div className="time-input-group">
                    <label htmlFor="startTime">INICIO</label>
                    <input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => onStartTimeChange(e.target.value)}
                        min="08:00"
                        max="18:00"
                        className={hasTimeConflict ? 'time-conflict' : ''}
                    />
                </div>

                <div className="time-separator">→</div>

                <div className="time-input-group">
                    <label htmlFor="endTime">FIN</label>
                    <input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => onEndTimeChange(e.target.value)}
                        min="08:00"
                        max="18:00"
                        className={hasTimeConflict ? 'time-conflict' : ''}
                    />
                </div>
            </div>

            {hasTimeConflict && (
                <div className="time-conflict-warning">
                    <span className="conflict-icon">⚠️</span>
                    <span>El horario seleccionado se solapa con una reserva existente</span>
                </div>
            )}

            {/* Timeline visualization */}
            {selectedDate && (
                <div className={`time-slots-section ${slotsUpdatedFlag ? 'slots-updated' : ''}`}>
                    {slotsUpdatedFlag && (
                        <div className="slots-updated-banner">
                            <span>🔄 Disponibilidad actualizada en tiempo real</span>
                        </div>
                    )}
                    <div className="time-slots-header">
                        <span className="time-slots-title">Disponibilidad del día</span>
                        {loadingSlots && <span className="time-slots-loading">Cargando...</span>}
                    </div>

                    <div className="time-slots-timeline">
                        {HOURS.map((hour) => {
                            const busy = isSlotBusy(hour.start, hour.end, busySlots);
                            const selected = isSlotSelected(hour.start, hour.end, startTime, endTime);
                            const conflict = isSlotConflict(hour.start, hour.end, startTime, endTime, busySlots);

                            let slotClass = 'time-slot';
                            if (conflict) slotClass += ' conflict';
                            else if (busy) slotClass += ' busy';
                            else if (selected) slotClass += ' selected';
                            else slotClass += ' free';

                            return (
                                <div key={hour.start} className={slotClass} title={
                                    busy
                                        ? `${hour.start} - ${hour.end} (Ocupado)`
                                        : `${hour.start} - ${hour.end} (Disponible)`
                                }>
                                    <span className="time-slot-label">{hour.label}</span>
                                    <div className="time-slot-bar"></div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="time-slots-legend">
                        <div className="slot-legend-item">
                            <span className="slot-legend-box free"></span>
                            <span>Disponible</span>
                        </div>
                        <div className="slot-legend-item">
                            <span className="slot-legend-box busy"></span>
                            <span>Ocupado</span>
                        </div>
                        <div className="slot-legend-item">
                            <span className="slot-legend-box selected"></span>
                            <span>Seleccionado</span>
                        </div>
                    </div>

                    {hasBusySlots && (
                        <div className="busy-slots-detail">
                            <span className="busy-detail-title">Reservas existentes:</span>
                            {busySlots.map((slot, idx) => (
                                <span key={idx} className="busy-slot-tag">
                                    {slot.start} - {slot.end}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="time-info">
                <span className="info-icon">ℹ️</span>
                <span>Horario disponible: 8:00 AM - 6:00 PM</span>
            </div>
        </div>
    );
};
