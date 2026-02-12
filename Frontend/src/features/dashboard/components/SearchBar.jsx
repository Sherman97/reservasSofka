import React from 'react';

export const SearchBar = ({ searchQuery, handleSearch, filters, onFilterChange }) => {
    return (
        <div className="search-bar-container">
            <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Buscar salas..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>
            <div className="top-filters">
                <button
                    className={`filter-btn ${filters.room && !filters.equipment ? 'active' : ''}`}
                    onClick={() => onFilterChange('room', true)}
                >
                    Salas
                </button>
                {/* Inventory is hidden from cards as per requirements */}
            </div>
            <div className="date-filter">
                <span className="filter-label">RANGO DE FECHAS</span>
                <span className="filter-value">Oct 24 - Oct 26, 2023</span>
            </div>
        </div>
    );
};
