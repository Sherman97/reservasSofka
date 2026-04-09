import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));

vi.mock('../../../core/adapters/hooks/useDependencies', () => ({
    useAuthDependencies: () => ({
        logoutUseCase: { execute: mockLogoutExecute },
    }),
}));

vi.mock('../../../assets/LogoSofka_FondoBlanco_peq.png', () => ({ default: 'logo-light.png' }));
vi.mock('../../../assets/LogoSofka_FondoNegro_peq.png', () => ({ default: 'logo-dark.png' }));
vi.mock('../../styles/common/Header.css', () => ({}));

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        const mockStorage = {
            user: JSON.stringify({
                name: 'Test User',
                username: 'testuser',
                roles: ['admin'],
            }),
        };
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] || null);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderHeader = () => render(
        <MemoryRouter>
            <Header />
        </MemoryRouter>,
    );

    it('debe renderizar el titulo', () => {
        renderHeader();
        expect(screen.getByText('Reservas Casa Sofka')).toBeDefined();
    });

    it('debe mostrar el nombre de usuario', () => {
        renderHeader();
        expect(screen.getByText('testuser')).toBeDefined();
    });

    it('debe tener enlaces de navegacion', () => {
        renderHeader();
        expect(screen.getByText('Explorar')).toBeDefined();
        expect(screen.getByText('Mis Reservas')).toBeDefined();
    });

    it('debe mostrar boton de tema', () => {
        renderHeader();
        expect(screen.getByText('🌙')).toBeDefined();
    });

    it('debe mostrar menu de usuario al hacer clic', () => {
        renderHeader();
        fireEvent.click(screen.getByText('testuser'));
        expect(screen.getByText('Cerrar Sesion')).toBeDefined();
    });

    it('debe tener boton hamburguesa para movil', () => {
        renderHeader();
        expect(screen.getByLabelText('Menu de navegacion')).toBeDefined();
    });

    it('debe mostrar menu movil al hacer clic en hamburguesa', () => {
        renderHeader();
        fireEvent.click(screen.getByLabelText('Menu de navegacion'));
        expect(screen.getAllByText('Explorar').length).toBeGreaterThanOrEqual(2);
    });

    it('debe usar nombre generico si no hay usuario en localStorage', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
        renderHeader();
        expect(screen.getByText('Usuario')).toBeDefined();
    });

    it('debe ejecutar logout y navegar a /login', async () => {
        renderHeader();
        fireEvent.click(screen.getByText('testuser'));
        fireEvent.click(screen.getByText('Cerrar Sesion'));

        await waitFor(() => {
            expect(mockLogoutExecute).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('debe cerrar menu de usuario al hacer clic fuera', () => {
        renderHeader();
        fireEvent.click(screen.getByText('testuser'));
        expect(screen.getByText('Cerrar Sesion')).toBeDefined();
        fireEvent.mouseDown(document.body);
        expect(screen.queryByText('Cerrar Sesion')).toBeNull();
    });

    it('debe cerrar menu hamburguesa al hacer clic fuera', () => {
        renderHeader();
        fireEvent.click(screen.getByLabelText('Menu de navegacion'));
        expect(screen.getAllByText('Explorar').length).toBeGreaterThanOrEqual(2);
        fireEvent.mouseDown(document.body);
        expect(screen.getAllByText('Explorar').length).toBe(1);
    });

    it('debe cerrar menu hamburguesa al hacer clic en enlace', () => {
        renderHeader();
        fireEvent.click(screen.getByLabelText('Menu de navegacion'));
        const explorarLinks = screen.getAllByText('Explorar');
        fireEvent.click(explorarLinks[explorarLinks.length - 1]);
        expect(screen.getAllByText('Explorar').length).toBe(1);
    });

    it('debe alternar menu hamburguesa', () => {
        renderHeader();
        const hamburger = screen.getByLabelText('Menu de navegacion');
        fireEvent.click(hamburger);
        expect(screen.getAllByText('Explorar').length).toBeGreaterThanOrEqual(2);
        fireEvent.click(hamburger);
        expect(screen.getAllByText('Explorar').length).toBe(1);
    });

    it('debe mostrar gestion de reservas cuando el usuario es admin', () => {
        renderHeader();
        expect(screen.getByText('Gestion de Reservas')).toBeDefined();
    });
});
