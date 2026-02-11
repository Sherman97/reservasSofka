import React from 'react';
import './Pagination.css';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination-container">
            <button
                className="pagination-btn prev"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                ← Anterior
            </button>
            <div className="pagination-numbers">
                {pages.map(page => (
                    <button
                        key={page}
                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>
            <button
                className="pagination-btn next"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Siguiente →
            </button>
        </div>
    );
};
