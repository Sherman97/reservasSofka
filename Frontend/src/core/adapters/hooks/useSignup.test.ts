import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSignup } from './useSignup';

const mockNavigate = vi.fn();
const mockRegisterExecute = vi.fn();
const mockLoginExecute = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('../providers/DependencyProvider', () => ({
    useAuthDependencies: () => ({
        registerUseCase: { execute: mockRegisterExecute },
        loginUseCase: { execute: mockLoginExecute }
    })
}));

describe('useSignup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRegisterExecute.mockResolvedValue({ id: 'u1' });
        mockLoginExecute.mockResolvedValue({ id: 'u1' });
    });

    it('debe inicializar con formulario vacío', () => {
        const { result } = renderHook(() => useSignup());
        expect(result.current.formData).toEqual({
            fullName: '', email: '', password: '', confirmPassword: '', termsAccepted: false
        });
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('debe actualizar campos de texto con handleChange', () => {
        const { result } = renderHook(() => useSignup());
        act(() => {
            result.current.handleChange({ target: { name: 'email', value: 'a@b.com', type: 'text', checked: false } } as React.ChangeEvent<HTMLInputElement>);
        });
        expect(result.current.formData.email).toBe('a@b.com');
    });

    it('debe actualizar checkbox con handleChange', () => {
        const { result } = renderHook(() => useSignup());
        act(() => {
            result.current.handleChange({ target: { name: 'termsAccepted', value: '', type: 'checkbox', checked: true } } as React.ChangeEvent<HTMLInputElement>);
        });
        expect(result.current.formData.termsAccepted).toBe(true);
    });

    it('debe registrar y navegar a /dashboard exitosamente', async () => {
        const { result } = renderHook(() => useSignup());

        // Fill form
        act(() => {
            result.current.handleChange({ target: { name: 'fullName', value: 'Test User', type: 'text', checked: false } } as React.ChangeEvent<HTMLInputElement>);
        });
        act(() => {
            result.current.handleChange({ target: { name: 'email', value: 'a@b.com', type: 'text', checked: false } } as React.ChangeEvent<HTMLInputElement>);
        });
        act(() => {
            result.current.handleChange({ target: { name: 'password', value: '123456', type: 'text', checked: false } } as React.ChangeEvent<HTMLInputElement>);
        });
        act(() => {
            result.current.handleChange({ target: { name: 'confirmPassword', value: '123456', type: 'text', checked: false } } as React.ChangeEvent<HTMLInputElement>);
        });
        act(() => {
            result.current.handleChange({ target: { name: 'termsAccepted', value: '', type: 'checkbox', checked: true } } as React.ChangeEvent<HTMLInputElement>);
        });

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
        });

        expect(mockRegisterExecute).toHaveBeenCalledWith({ name: 'Test User', email: 'a@b.com', password: '123456' });
        expect(mockLoginExecute).toHaveBeenCalledWith({ email: 'a@b.com', password: '123456' });
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('debe mostrar error si contraseñas no coinciden', async () => {
        const { result } = renderHook(() => useSignup());

        act(() => {
            result.current.handleChange({ target: { name: 'password', value: '123456', type: 'text', checked: false } } as React.ChangeEvent<HTMLInputElement>);
        });
        act(() => {
            result.current.handleChange({ target: { name: 'confirmPassword', value: '654321', type: 'text', checked: false } } as React.ChangeEvent<HTMLInputElement>);
        });
        act(() => {
            result.current.handleChange({ target: { name: 'termsAccepted', value: '', type: 'checkbox', checked: true } } as React.ChangeEvent<HTMLInputElement>);
        });

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
        });

        expect(result.current.error).toBe('Las contraseñas no coinciden');
        expect(mockRegisterExecute).not.toHaveBeenCalled();
    });

    it('debe mostrar error si términos no aceptados', async () => {
        const { result } = renderHook(() => useSignup());

        act(() => {
            result.current.handleChange({ target: { name: 'password', value: '123456', type: 'text', checked: false } } as React.ChangeEvent<HTMLInputElement>);
        });
        act(() => {
            result.current.handleChange({ target: { name: 'confirmPassword', value: '123456', type: 'text', checked: false } } as React.ChangeEvent<HTMLInputElement>);
        });

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
        });

        expect(result.current.error).toBe('Debes aceptar los términos y condiciones');
    });

    it('debe mostrar error si registro falla', async () => {
        mockRegisterExecute.mockRejectedValue(new Error('Email ya existe'));
        const { result } = renderHook(() => useSignup());

        act(() => {
            result.current.handleChange({ target: { name: 'password', value: '123456', type: 'text', checked: false } } as React.ChangeEvent<HTMLInputElement>);
        });
        act(() => {
            result.current.handleChange({ target: { name: 'confirmPassword', value: '123456', type: 'text', checked: false } } as React.ChangeEvent<HTMLInputElement>);
        });
        act(() => {
            result.current.handleChange({ target: { name: 'termsAccepted', value: '', type: 'checkbox', checked: true } } as React.ChangeEvent<HTMLInputElement>);
        });

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
        });

        expect(result.current.error).toBe('Email ya existe');
        expect(result.current.loading).toBe(false);
    });
});
