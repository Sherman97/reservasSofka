import React from 'react';

export const SearchBar = ({ searchQuery, handleSearch }) => {
    return (
        <div className="search-bar-container">
            <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Buscar salas o equipo..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>
            <div className="top-filters">
                <button className="filter-btn active">Todos</button>
                <button className="filter-btn">Salas</button>
                <button className="filter-btn">Equipos</button>
            </div>
            <div className="date-filter">
                <span className="filter-label">RANGO DE FECHAS</span>
                <span className="filter-value">Oct 24 - Oct 26, 2023</span>
            </div>
            <div className="capacity-filter">
                <span className="filter-label">CAPACIDAD</span>
                <div className="filter-dropdown">
                    <span>4 - 8 Personas</span>
                    <span className="dropdown-arrow">▼</span>
                </div>
            </div>
        </div>
    );
};
