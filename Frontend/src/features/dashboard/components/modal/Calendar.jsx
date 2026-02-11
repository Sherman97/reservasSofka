import React from 'react';

export const Calendar = ({
    currentDate,
    selectedDate,
    availability,
    onDateSelect,
    onPreviousMonth,
    onNextMonth
}) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];

    // Empty cells for days before the month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isAvailable = availability[day]?.available;
        const isSelected = selectedDate === day;
        const isPast = new Date(year, month, day) < new Date().setHours(0, 0, 0, 0);

        days.push(
            <div
                key={day}
                className={`calendar-day ${isAvailable && !isPast ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                onClick={() => !isPast && onDateSelect(day)}
            >
                {day}
            </div>
        );
    }

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button onClick={onPreviousMonth} className="calendar-nav-btn">←</button>
                <h3>{monthNames[month]} {year}</h3>
                <button onClick={onNextMonth} className="calendar-nav-btn">→</button>
            </div>

            <div className="calendar-weekdays">
                <div>Dom</div>
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
            </div>

            <div className="calendar-grid">
                {days}
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <span className="legend-box available"></span>
                    <span>DISPONIBLE</span>
                </div>
                <div className="legend-item">
                    <span className="legend-box selected"></span>
                    <span>SELECCIONADO</span>
                </div>
                <div className="legend-item">
                    <span className="legend-box unavailable">✕</span>
                    <span>OCUPADO</span>
                </div>
            </div>
        </div>
    );
};
