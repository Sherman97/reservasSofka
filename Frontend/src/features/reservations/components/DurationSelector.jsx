import React from 'react';

export const DurationSelector = ({
    startTime,
    endTime,
    onStartTimeChange,
    onEndTimeChange
}) => {
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
                    />
                </div>
            </div>

            <div className="time-info">
                <span className="info-icon">ℹ️</span>
                <span>Horario disponible: 8:00 AM - 6:00 PM</span>
            </div>
        </div>
    );
};
