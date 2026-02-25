import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from './SignupPage';

vi.mock('../../components/signup/SignupForm', () => ({
    SignupForm: () => <div data-testid="signup-form">Mocked SignupForm</div>,
}));

describe('SignupPage', () => {
    it('should render page structure', () => {
        render(
            <MemoryRouter>
                <SignupPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/gestiona tus recursos internos/i)).toBeInTheDocument();
        expect(screen.getByText(/registro de nuevo usuario/i)).toBeInTheDocument();
    });

    it('should render SignupForm component', () => {
        render(
            <MemoryRouter>
                <SignupPage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    });

    it('should display branding', () => {
        render(
            <MemoryRouter>
                <SignupPage />
            </MemoryRouter>
        );

        expect(screen.getByText('📅')).toBeInTheDocument();
        expect(screen.getByText('Booking Platform')).toBeInTheDocument();
    });

    it('should display subtitle', () => {
        render(
            <MemoryRouter>
                <SignupPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/crea tu cuenta corporativa/i)).toBeInTheDocument();
    });
});
