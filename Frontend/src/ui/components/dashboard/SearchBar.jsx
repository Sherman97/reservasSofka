import React from 'react';

export const SearchBar = ({ searchQuery, handleSearch }) => {
    return (
        <div className="search-bar-container">
            <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Buscar salas o equipos..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>
        </div>
    );
};
