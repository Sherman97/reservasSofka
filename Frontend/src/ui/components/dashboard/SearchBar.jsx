import React from 'react';
import { FiSearch } from 'react-icons/fi';

export const SearchBar = ({ searchQuery, handleSearch }) => {
    return (
        <div className="search-bar-container">
            <div className="search-input-wrapper">
                <FiSearch className="search-icon" size={20} />
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
