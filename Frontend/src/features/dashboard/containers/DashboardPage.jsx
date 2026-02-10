import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { FilterSidebar } from '../components/FilterSidebar';
import { ItemCard } from '../components/ItemCard';
import { HelpBanner } from '../components/HelpBanner';
import '../styles/Dashboard.css';

const DashboardPage = () => {
    const { items, loading, searchQuery, handleSearch, filters, handleFilterChange } = useDashboard();

    return (
        <div className="dashboard-container">
            <Header />
            <main className="dashboard-main">
                <SearchBar searchQuery={searchQuery} handleSearch={handleSearch} />

                <div className="dashboard-content">
                    <div className="dashboard-results-section">
                        <div className="results-header">
                            <h2>Resultados <span className="results-count">({items.length} elementos encontrados)</span></h2>
                            <div className="view-toggle">
                                <button className="view-btn active">GridView</button>
                                <button className="view-btn">ListView</button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-state">Cargando inventario...</div>
                        ) : (
                            <div className="results-grid">
                                {items.map(item => (
                                    <ItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="dashboard-sidebar">
                        <FilterSidebar filters={filters} handleFilterChange={handleFilterChange} />
                        <HelpBanner />
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
