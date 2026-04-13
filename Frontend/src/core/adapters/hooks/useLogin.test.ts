import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogin } from './useLogin';

const mockNavigate = vi.fn();
const mockExecute = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('../providers/DependencyProvider', () => ({
    useAuthDependencies: () => ({
        loginUseCase: { execute: mockExecute }
    })
}));

describe('useLogin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockExecute.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    });

    it('debe inicializar con valores vacíos', () => {
        const { result } = renderHook(() => useLogin());
        expect(result.current.email).toBe('');
        expect(result.current.password).toBe('');
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('debe actualizar email y password', () => {
        const { result } = renderHook(() => useLogin());
        act(() => { result.current.setEmail('test@mail.com'); });
        expect(result.current.email).toBe('test@mail.com');
        act(() => { result.current.setPassword('123456'); });
        expect(result.current.password).toBe('123456');
    });

    it('debe hacer login exitoso y navegar a /dashboard', async () => {
        const { result } = renderHook(() => useLogin());
        act(() => { result.current.setEmail('a@b.com'); });
        act(() => { result.current.setPassword('123456'); });

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
        });

        expect(mockExecute).toHaveBeenCalledWith({ email: 'a@b.com', password: '123456' });
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('');
    });

    it('debe mostrar error si login falla', async () => {
        mockExecute.mockRejectedValue(new Error('Credenciales inválidas'));
        const { result } = renderHook(() => useLogin());

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
        });

        expect(result.current.error).toBe('Credenciales inválidas');
        expect(result.current.loading).toBe(false);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('debe mostrar error genérico si no hay mensaje', async () => {
        mockExecute.mockRejectedValue({});
        const { result } = renderHook(() => useLogin());

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
        });

        expect(result.current.error).toBe('Error al iniciar sesión');
    });
});
