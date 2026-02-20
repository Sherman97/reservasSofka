import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mutable mock state
let mockSignupState = {};

vi.mock('../../../core/adapters/hooks/useSignup', () => ({
    useSignup: () => mockSignupState,
}));

import { SignupForm } from './SignupForm';

describe('SignupForm', () => {
    beforeEach(() => {
        mockSignupState = {
            formData: {
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                termsAccepted: false,
            },
            handleChange: vi.fn(),
            handleSubmit: vi.fn((e) => e.preventDefault()),
            loading: false,
            error: '',
        };
    });

    const renderForm = () =>
        render(
            <MemoryRouter>
                <SignupForm />
            </MemoryRouter>
        );

    it('should render all form fields', () => {
        renderForm();
        expect(screen.getByPlaceholderText(/juan pérez/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('usuario@empresa.com')).toBeInTheDocument();
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        expect(passwordInputs).toHaveLength(2);
    });

    it('should render terms checkbox', () => {
        renderForm();
        expect(screen.getByLabelText(/acepto los/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
        renderForm();
        expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
    });

    it('should render login link', () => {
        renderForm();
        expect(screen.getByText(/inicia sesión/i)).toBeInTheDocument();
    });

    it('should call handleChange on input change', () => {
        renderForm();
        fireEvent.change(screen.getByPlaceholderText('usuario@empresa.com'), {
            target: { value: 'new@empresa.com', name: 'email' },
        });
        expect(mockSignupState.handleChange).toHaveBeenCalled();
    });

    it('should call handleSubmit on form submission', () => {
        renderForm();
        fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }));
        expect(mockSignupState.handleSubmit).toHaveBeenCalled();
    });

    it('should disable button and show loading text when loading', () => {
        mockSignupState = { ...mockSignupState, loading: true };
        renderForm();
        const btn = screen.getByRole('button', { name: /creando cuenta/i });
        expect(btn).toBeDisabled();
    });

    it('should display error message when error exists', () => {
        mockSignupState = { ...mockSignupState, error: 'Las contraseñas no coinciden' };
        renderForm();
        expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    });
});
