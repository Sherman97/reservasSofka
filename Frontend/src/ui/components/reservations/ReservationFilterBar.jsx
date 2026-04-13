import React from 'react';
import { FiSearch } from 'react-icons/fi';

/**
 * ReservationFilterBar - UI Component
 * Filter tabs and search for reservations
 */
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
                    <FiSearch className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar por lugar o ID..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
