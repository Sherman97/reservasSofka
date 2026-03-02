import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogout } from './useLogout';

const mockNavigate = vi.fn();
const mockExecute = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('../providers/DependencyProvider', () => ({
    useAuthDependencies: () => ({
        logoutUseCase: { execute: mockExecute }
    })
}));

describe('useLogout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockExecute.mockResolvedValue(undefined);
    });

    it('debe retornar función logout', () => {
        const { result } = renderHook(() => useLogout());
        expect(typeof result.current.logout).toBe('function');
    });

    it('debe ejecutar logoutUseCase y navegar a /login', async () => {
        const { result } = renderHook(() => useLogout());

        await act(async () => {
            await result.current.logout();
        });

        expect(mockExecute).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('debe navegar a /login incluso si logout falla', async () => {
        mockExecute.mockRejectedValue(new Error('Logout failed'));
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = renderHook(() => useLogout());

        await act(async () => {
            await result.current.logout();
        });

        expect(mockNavigate).toHaveBeenCalledWith('/login');
        vi.restoreAllMocks();
    });
});
