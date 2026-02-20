import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mutable mock state
let mockLoginState = {};

vi.mock('../../../core/adapters/hooks/useLogin', () => ({
    useLogin: () => mockLoginState,
}));

vi.mock('../../../context/ThemeContext', () => ({
    useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));

import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
    beforeEach(() => {
        mockLoginState = {
            email: '',
            password: '',
            loading: false,
            error: '',
            setEmail: vi.fn(),
            setPassword: vi.fn(),
            handleSubmit: vi.fn((e) => e.preventDefault()),
        };
    });

    const renderForm = () =>
        render(
            <MemoryRouter>
                <LoginForm />
            </MemoryRouter>
        );

    it('should render email and password inputs', () => {
        renderForm();
        expect(screen.getByPlaceholderText('ejemplo@empresa.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('should render submit button', () => {
        renderForm();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('should render signup link', () => {
        renderForm();
        expect(screen.getByText(/regístrate aquí/i)).toBeInTheDocument();
    });

    it('should call setEmail on email input change', () => {
        renderForm();
        fireEvent.change(screen.getByPlaceholderText('ejemplo@empresa.com'), {
            target: { value: 'test@empresa.com' },
        });
        expect(mockLoginState.setEmail).toHaveBeenCalledWith('test@empresa.com');
    });

    it('should call setPassword on password input change', () => {
        renderForm();
        fireEvent.change(screen.getByPlaceholderText('••••••••'), {
            target: { value: 'secret123' },
        });
        expect(mockLoginState.setPassword).toHaveBeenCalledWith('secret123');
    });

    it('should call handleSubmit on form submission', () => {
        renderForm();
        fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }));
        expect(mockLoginState.handleSubmit).toHaveBeenCalled();
    });

    it('should show loading text and disable button when loading', () => {
        mockLoginState = { ...mockLoginState, loading: true };
        renderForm();
        const btn = screen.getByRole('button', { name: /cargando/i });
        expect(btn).toBeDisabled();
    });

    it('should display error message when error exists', () => {
        mockLoginState = { ...mockLoginState, error: 'Credenciales inválidas' };
        renderForm();
        expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
});
