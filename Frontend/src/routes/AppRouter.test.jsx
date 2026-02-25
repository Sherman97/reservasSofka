import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// ---- Mock all child pages and layouts to isolate routing logic ----

vi.mock('../ui/pages/auth/LoginPage', () => ({
    default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('../ui/pages/signup/SignupPage', () => ({
    default: () => <div data-testid="signup-page">Signup Page</div>,
}));

vi.mock('../ui/pages/dashboard/DashboardPage', () => ({
    default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock('../ui/pages/reservations/MyReservationsPage', () => ({
    MyReservationsPage: () => <div data-testid="reservations-page">My Reservations Page</div>,
}));

vi.mock('../ui/layouts/MainLayout', () => ({
    MainLayout: () => (
        <div data-testid="main-layout">
            <Outlet />
        </div>
    ),
}));

// Mock ProtectedRoute to use localStorage check
vi.mock('../ui/components/common/ProtectedRoute', () => ({
    default: () => {
        const token = localStorage.getItem('token');
        if (!token) return <Navigate to="/login" replace />;
        return <Outlet />;
    },
}));

// We cannot use the real BrowserRouter inside tests,
// so we render the route config manually with MemoryRouter

// Import after mocks
import LoginPage from '../ui/pages/auth/LoginPage';
import SignupPage from '../ui/pages/signup/SignupPage';
import DashboardPage from '../ui/pages/dashboard/DashboardPage';
import { MyReservationsPage } from '../ui/pages/reservations/MyReservationsPage';
import { MainLayout } from '../ui/layouts/MainLayout';
import ProtectedRoute from '../ui/components/common/ProtectedRoute';

/**
 * Helper to render the app's route structure using MemoryRouter
 * (mirrors AppRouter but without BrowserRouter)
 */
const renderApp = (initialRoute = '/') =>
    render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/my-reservations" element={<MyReservationsPage />} />
                    </Route>
                </Route>
            </Routes>
        </MemoryRouter>
    );

describe('AppRouter - Routing Integration', () => {
    const originalGetItem = Storage.prototype.getItem;

    beforeEach(() => {
        Storage.prototype.getItem = vi.fn().mockReturnValue(null);
    });

    afterEach(() => {
        Storage.prototype.getItem = originalGetItem;
    });

    // ---- Public routes ----

    it('should render LoginPage on "/" route', () => {
        renderApp('/');
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should render LoginPage on "/login" route', () => {
        renderApp('/login');
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should render SignupPage on "/signup" route', () => {
        renderApp('/signup');
        expect(screen.getByTestId('signup-page')).toBeInTheDocument();
    });

    // ---- Protected routes without auth ----

    it('should redirect to login when accessing /dashboard without token', () => {
        renderApp('/dashboard');
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
    });

    it('should redirect to login when accessing /my-reservations without token', () => {
        renderApp('/my-reservations');
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(screen.queryByTestId('reservations-page')).not.toBeInTheDocument();
    });

    // ---- Protected routes with auth ----

    it('should render DashboardPage when authenticated and navigating to /dashboard', () => {
        Storage.prototype.getItem = vi.fn().mockReturnValue('jwt-token-123');

        renderApp('/dashboard');

        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should render MyReservationsPage when authenticated and navigating to /my-reservations', () => {
        Storage.prototype.getItem = vi.fn().mockReturnValue('jwt-token-123');

        renderApp('/my-reservations');

        expect(screen.getByTestId('reservations-page')).toBeInTheDocument();
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should wrap protected routes in MainLayout', () => {
        Storage.prototype.getItem = vi.fn().mockReturnValue('jwt-token-123');

        renderApp('/dashboard');

        const layout = screen.getByTestId('main-layout');
        const dashboard = screen.getByTestId('dashboard-page');
        expect(layout).toContainElement(dashboard);
    });
});
