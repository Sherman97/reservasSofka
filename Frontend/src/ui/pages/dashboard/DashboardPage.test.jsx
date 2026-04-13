import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../core/adapters/hooks/useDashboard', () => ({
    useDashboard: vi.fn()
}));

// Mock sub-components to isolate page logic
vi.mock('../../components/dashboard/SearchBar', () => ({
    SearchBar: ({ searchQuery, handleSearch }) => (
        <input data-testid="search" value={searchQuery} onChange={handleSearch} />
    )
}));

vi.mock('../../components/dashboard/ItemCard', () => ({
    ItemCard: ({ item }) => <div data-testid="item-card">{item.title}</div>
}));

vi.mock('../../components/common/Pagination', () => ({
    Pagination: ({ _currentPage, totalPages, onPageChange }) => (
        <div data-testid="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} data-testid={`page-${i + 1}`} onClick={() => onPageChange(i + 1)}>
                    {i + 1}
                </button>
            ))}
        </div>
    )
}));

vi.mock('../../styles/dashboard/Dashboard.css', () => ({}));

import DashboardPage from './DashboardPage';
import { useDashboard } from '../../../core/adapters/hooks/useDashboard';

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe mostrar loading spinner cuando loading=true', () => {
        useDashboard.mockReturnValue({
            items: [], loading: true, error: null, reload: vi.fn(),
            searchQuery: '', handleSearch: vi.fn()
        });

        render(<MemoryRouter><DashboardPage /></MemoryRouter>);
        expect(screen.getByText('Cargando inventario...')).toBeDefined();
    });

    it('debe mostrar error con botón reintentar', () => {
        useDashboard.mockReturnValue({
            items: [], loading: false, error: 'Error de red', reload: vi.fn(),
            searchQuery: '', handleSearch: vi.fn()
        });

        render(<MemoryRouter><DashboardPage /></MemoryRouter>);
        expect(screen.getByText(/Error de red/)).toBeDefined();
        expect(screen.getByText('Reintentar')).toBeDefined();
    });

    it('debe mostrar items cuando hay datos', () => {
        useDashboard.mockReturnValue({
            items: [
                { id: '1', title: 'Sala A', _type: 'location' },
                { id: '2', title: 'Proyector', _type: 'inventory' }
            ],
            loading: false, error: null, reload: vi.fn(),
            searchQuery: '', handleSearch: vi.fn()
        });

        render(<MemoryRouter><DashboardPage /></MemoryRouter>);
        expect(screen.getByText('Sala A')).toBeDefined();
        expect(screen.getByText('Proyector')).toBeDefined();
    });

    it('debe mostrar mensaje de sin resultados', () => {
        useDashboard.mockReturnValue({
            items: [], loading: false, error: null, reload: vi.fn(),
            searchQuery: '', handleSearch: vi.fn()
        });

        render(<MemoryRouter><DashboardPage /></MemoryRouter>);
        expect(screen.getByText('No se encontraron elementos en esta casa Sofka.')).toBeDefined();
    });

    it('debe mostrar contador de resultados', () => {
        useDashboard.mockReturnValue({
            items: [{ id: '1', title: 'Sala A', _type: 'location' }],
            loading: false, error: null, reload: vi.fn(),
            searchQuery: '', handleSearch: vi.fn()
        });

        render(<MemoryRouter><DashboardPage /></MemoryRouter>);
        expect(screen.getByText('(1 elementos encontrados)')).toBeDefined();
    });

    it('debe mostrar paginación cuando hay más de 8 items', () => {
        const items = Array.from({ length: 10 }, (_, i) => ({ id: `${i}`, title: `Item ${i}`, _type: 'location' }));
        useDashboard.mockReturnValue({
            items, loading: false, error: null, reload: vi.fn(),
            searchQuery: '', handleSearch: vi.fn()
        });

        render(<MemoryRouter><DashboardPage /></MemoryRouter>);
        expect(screen.getByTestId('pagination')).toBeDefined();
    });

    it('debe cambiar de página con handlePageChange', () => {
        const scrollToSpy = vi.fn();
        window.scrollTo = scrollToSpy;
        const items = Array.from({ length: 10 }, (_, i) => ({ id: `${i}`, title: `Item ${i}`, _type: 'location' }));
        useDashboard.mockReturnValue({
            items, loading: false, error: null, reload: vi.fn(),
            searchQuery: '', handleSearch: vi.fn()
        });

        render(<MemoryRouter><DashboardPage /></MemoryRouter>);
        fireEvent.click(screen.getByTestId('page-2'));
        expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
});
