import { describe, it, expect, vi } from 'vitest';
import { GetCurrentUserUseCase } from './GetCurrentUserUseCase';
import { User } from '../../../core/domain/entities/User';
import type { IAuthRepository } from '../../../core/ports/repositories/IAuthRepository';

describe('GetCurrentUserUseCase', () => {
    const mockUser = new User({ id: 'u1', email: 'test@mail.com', name: 'Test', role: 'user' });

    const createMockRepo = (overrides: Partial<IAuthRepository> = {}): IAuthRepository => ({
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        isAuthenticated: vi.fn(),
        getStoredUser: vi.fn().mockReturnValue(mockUser),
        ...overrides
    });

    it('debe retornar el usuario almacenado', () => {
        const repo = createMockRepo();
        const useCase = new GetCurrentUserUseCase(repo);
        const result = useCase.execute();
        expect(result).toBe(mockUser);
        expect(repo.getStoredUser).toHaveBeenCalled();
    });

    it('debe retornar null si no hay usuario almacenado', () => {
        const repo = createMockRepo({ getStoredUser: vi.fn().mockReturnValue(null) });
        const useCase = new GetCurrentUserUseCase(repo);
        const result = useCase.execute();
        expect(result).toBeNull();
    });
});
