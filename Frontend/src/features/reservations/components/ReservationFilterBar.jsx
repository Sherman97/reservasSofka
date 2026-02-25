import React from 'react';

export const ReservationFilterBar = ({
    activeTab,
    onTabChange,
    searchTerm,
    onSearchChange
}) => {
    return (
        <div className="filter-bar-container">
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => onTabChange('upcoming')}
                >
                    Próximas
                </button>
                <button
                    className={`filter-tab ${activeTab === 'past' ? 'active' : ''}`}
                    onClick={() => onTabChange('past')}
                >
                    Pasadas
                </button>
                <button
                    className={`filter-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                    onClick={() => onTabChange('cancelled')}
                >
                    Canceladas
                </button>
            </div>

            <div className="filter-controls">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar reserva..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <button className="type-filter-btn">
                    Tipo: Todos
                </button>
            </div>
        </div>
    );
};
