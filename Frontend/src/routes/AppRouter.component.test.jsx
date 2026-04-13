import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Outlet } from 'react-router-dom';

// Mock BrowserRouter → MemoryRouter so tests can work
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        BrowserRouter: ({ children }) => <actual.MemoryRouter>{children}</actual.MemoryRouter>,
    };
});

// Mock all child pages/layouts
vi.mock('../ui/pages/auth/LoginPage', () => ({
    default: () => <div data-testid="login-page">Login</div>,
}));
vi.mock('../ui/pages/signup/SignupPage', () => ({
    default: () => <div data-testid="signup-page">Signup</div>,
}));
vi.mock('../ui/pages/dashboard/DashboardPage', () => ({
    default: () => <div data-testid="dashboard-page">Dashboard</div>,
}));
vi.mock('../ui/pages/reservations/MyReservationsPage', () => ({
    MyReservationsPage: () => <div data-testid="reservations-page">Reservations</div>,
}));
vi.mock('../ui/layouts/MainLayout', () => ({
    MainLayout: () => <div data-testid="main-layout"><Outlet /></div>,
}));
vi.mock('../ui/components/common/ProtectedRoute', () => ({
    default: ({ _children }) => <Outlet />,
}));

import AppRouter from './AppRouter';

describe('AppRouter Component', () => {
    beforeEach(() => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    });

    afterEach(() => { vi.restoreAllMocks(); });

    it('debe renderizar el componente AppRouter', () => {
        render(<AppRouter />);
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
});
