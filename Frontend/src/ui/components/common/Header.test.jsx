import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

const mockNavigate = vi.fn();
const mockLogoutExecute = vi.fn().mockResolvedValue(undefined);

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../../core/adapters/providers/ThemeContext', () => ({
    useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() })
}));

vi.mock('../../../core/adapters/hooks/useDependencies', () => ({
    useAuthDependencies: () => ({
        logoutUseCase: { execute: mockLogoutExecute }
    })
}));

// Mock image imports
vi.mock('../../../assets/LogoSofka_FondoBlanco_peq.png', () => ({ default: 'logo-light.png' }));
vi.mock('../../../assets/LogoSofka_FondoNegro_peq.png', () => ({ default: 'logo-dark.png' }));
vi.mock('../../styles/common/Header.css', () => ({}));

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock localStorage for user
        const mockStorage = { user: JSON.stringify({ name: 'Test User', username: 'testuser' }) };
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] || null);
    });

    afterEach(() => { vi.restoreAllMocks(); }); // eslint-disable-line no-undef

    const renderHeader = () => render(
        <MemoryRouter>
            <Header />
        </MemoryRouter>
    );

    it('debe renderizar el título', () => {
        renderHeader();
        expect(screen.getByText('Reservas Casa Sofka')).toBeDefined();
    });

    it('debe mostrar el nombre de usuario', () => {
        renderHeader();
        expect(screen.getByText('testuser')).toBeDefined();
    });

    it('debe tener enlaces de navegación', () => {
        renderHeader();
        expect(screen.getByText('Explorar')).toBeDefined();
        expect(screen.getByText('Mis Reservas')).toBeDefined();
    });

    it('debe mostrar botón de tema', () => {
        renderHeader();
        expect(screen.getByText('🌙')).toBeDefined();
    });

    it('debe mostrar menú de usuario al hacer clic', () => {
        renderHeader();
        fireEvent.click(screen.getByText('testuser'));
        expect(screen.getByText('Cerrar Sesión')).toBeDefined();
    });

    it('debe tener botón hamburguesa para móvil', () => {
        renderHeader();
        const hamburger = screen.getByLabelText('Menú de navegación');
        expect(hamburger).toBeDefined();
    });

    it('debe mostrar menú móvil al hacer clic en hamburguesa', () => {
        renderHeader();
        fireEvent.click(screen.getByLabelText('Menú de navegación'));
        // The mobile menu should appear with Explorar and Mis Reservas links
        const allExplorar = screen.getAllByText('Explorar');
        expect(allExplorar.length).toBeGreaterThanOrEqual(2); // desktop nav + mobile dropdown
    });

    it('debe usar nombre genérico si no hay usuario en localStorage', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
        renderHeader();
        expect(screen.getByText('Usuario')).toBeDefined();
    });

    it('debe ejecutar logout y navegar a /login', async () => {
        renderHeader();
        // Open user menu
        fireEvent.click(screen.getByText('testuser'));
        // Click logout
        fireEvent.click(screen.getByText('Cerrar Sesión'));

        await waitFor(() => {
            expect(mockLogoutExecute).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('debe cerrar menú de usuario al hacer clic fuera', () => {
        renderHeader();
        // Open user menu
        fireEvent.click(screen.getByText('testuser'));
        expect(screen.getByText('Cerrar Sesión')).toBeDefined();

        // Click outside
        fireEvent.mouseDown(document.body);

        expect(screen.queryByText('Cerrar Sesión')).toBeNull();
    });

    it('debe cerrar menú hamburguesa al hacer clic fuera', () => {
        renderHeader();
        // Open hamburger menu
        fireEvent.click(screen.getByLabelText('Menú de navegación'));
        const items = screen.getAllByText('Explorar');
        expect(items.length).toBeGreaterThanOrEqual(2);

        // Click outside
        fireEvent.mouseDown(document.body);

        // Mobile dropdown should be gone
        const itemsAfter = screen.getAllByText('Explorar');
        expect(itemsAfter.length).toBe(1); // Only desktop nav
    });

    it('debe cerrar menú hamburguesa al hacer clic en enlace', () => {
        renderHeader();
        // Open hamburger
        fireEvent.click(screen.getByLabelText('Menú de navegación'));

        // Click the mobile "Explorar" link (second occurrence)
        const explorarLinks = screen.getAllByText('Explorar');
        fireEvent.click(explorarLinks[explorarLinks.length - 1]);

        // Mobile menu should close
        const afterLinks = screen.getAllByText('Explorar');
        expect(afterLinks.length).toBe(1);
    });

    it('debe alternar menú hamburguesa', () => {
        renderHeader();
        const hamburger = screen.getByLabelText('Menú de navegación');

        // Open
        fireEvent.click(hamburger);
        expect(screen.getAllByText('Explorar').length).toBeGreaterThanOrEqual(2);

        // Close
        fireEvent.click(hamburger);
        expect(screen.getAllByText('Explorar').length).toBe(1);
    });
});
