import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { SearchBar } from '../components/SearchBar';
import { ItemCard } from '../components/ItemCard';
import { Pagination } from '../../../components/common/Pagination';
import '../styles/Dashboard.css';

const DashboardPage = () => {
    const { items, loading, searchQuery, handleSearch, filters, handleFilterChange } = useDashboard();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Pagination logic
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="dashboard-container">
            <main className="dashboard-main">
                <div className="container">
                    <SearchBar
                        searchQuery={searchQuery}
                        handleSearch={handleSearch}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />

                    <div className="dashboard-content">
                        <div className="dashboard-results-section">
                            <div className="results-header">
                                <h2>Resultados <span className="results-count">({items.length} elementos encontrados)</span></h2>
                            </div>

                            {loading ? (
                                <div className="loading-state">Cargando inventario...</div>
                            ) : (
                                <>
                                    <div className="results-grid">
                                        {currentItems.map(item => (
                                            <ItemCard key={item.id} item={item} />
                                        ))}
                                    </div>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
