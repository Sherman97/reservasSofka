import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

// Mock child components to isolate page rendering
vi.mock('../../components/auth/LoginForm', () => ({
    LoginForm: () => <div data-testid="login-form">Mocked LoginForm</div>,
}));

vi.mock('../../../context/ThemeContext', () => ({
    useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));

describe('LoginPage', () => {
    it('should render page structure', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/optimiza tu espacio de trabajo/i)).toBeInTheDocument();
        expect(screen.getByText(/bienvenido de nuevo/i)).toBeInTheDocument();
    });

    it('should render LoginForm component', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('should display branding elements', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        expect(screen.getByText('📅')).toBeInTheDocument();
        expect(screen.getByText('Reservas Sofka')).toBeInTheDocument();
    });

    it('should display subtitle text', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/ingresa tus credenciales/i)).toBeInTheDocument();
    });
});
