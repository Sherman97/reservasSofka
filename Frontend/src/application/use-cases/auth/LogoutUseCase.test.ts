import { describe, it, expect, vi } from 'vitest';
import { LogoutUseCase } from './LogoutUseCase';
import type { IAuthRepository } from '../../../core/ports/repositories/IAuthRepository';

describe('LogoutUseCase', () => {
    const createMockRepo = (overrides: Partial<IAuthRepository> = {}): IAuthRepository => ({
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn().mockResolvedValue(undefined),
        getCurrentUser: vi.fn(),
        isAuthenticated: vi.fn().mockReturnValue(false),
        getStoredUser: vi.fn(),
        ...overrides
    });

    it('debe ejecutar logout correctamente', async () => {
        const repo = createMockRepo();
        const useCase = new LogoutUseCase(repo);
        await useCase.execute();
        expect(repo.logout).toHaveBeenCalled();
    });

    it('isAuthenticated debe retornar estado del repositorio', () => {
        const repo = createMockRepo({ isAuthenticated: vi.fn().mockReturnValue(true) });
        const useCase = new LogoutUseCase(repo);
        expect(useCase.isAuthenticated()).toBe(true);
    });

    it('isAuthenticated debe retornar false si no hay sesión', () => {
        const repo = createMockRepo({ isAuthenticated: vi.fn().mockReturnValue(false) });
        const useCase = new LogoutUseCase(repo);
        expect(useCase.isAuthenticated()).toBe(false);
    });
});
