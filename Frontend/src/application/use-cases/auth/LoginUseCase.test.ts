import { describe, it, expect, vi } from 'vitest';
import { LoginUseCase } from './LoginUseCase';
import { AuthenticationError } from '../../../core/domain/errors/AuthenticationError';
import { User } from '../../../core/domain/entities/User';
import type { IAuthRepository } from '../../../core/ports/repositories/IAuthRepository';

describe('LoginUseCase', () => {
    const mockUser = new User({ id: 'u1', email: 'test@mail.com', name: 'Test', role: 'user' });

    const createMockRepo = (overrides: Partial<IAuthRepository> = {}): IAuthRepository => ({
        login: vi.fn().mockResolvedValue(mockUser),
        register: vi.fn(),
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        isAuthenticated: vi.fn(),
        getStoredUser: vi.fn(),
        ...overrides
    });

    it('debe ejecutar login con credenciales válidas', async () => {
        const repo = createMockRepo();
        const useCase = new LoginUseCase(repo);
        const result = await useCase.execute({ email: 'test@mail.com', password: '123456' });
        expect(result).toBe(mockUser);
        expect(repo.login).toHaveBeenCalledWith({ email: 'test@mail.com', password: '123456' });
    });

    it('debe lanzar error si email está vacío', async () => {
        const repo = createMockRepo();
        const useCase = new LoginUseCase(repo);
        await expect(useCase.execute({ email: '', password: '123' }))
            .rejects.toThrow(AuthenticationError);
    });

    it('debe lanzar error si password está vacío', async () => {
        const repo = createMockRepo();
        const useCase = new LoginUseCase(repo);
        await expect(useCase.execute({ email: 'test@mail.com', password: '' }))
            .rejects.toThrow(AuthenticationError);
    });

    it('debe lanzar error si email es inválido', async () => {
        const repo = createMockRepo();
        const useCase = new LoginUseCase(repo);
        await expect(useCase.execute({ email: 'not-an-email', password: '123456' }))
            .rejects.toThrow(AuthenticationError);
    });

    it('debe aceptar emails válidos con diferentes formatos', async () => {
        const repo = createMockRepo();
        const useCase = new LoginUseCase(repo);
        const result = await useCase.execute({ email: 'user.name@domain.co', password: '123456' });
        expect(result).toBe(mockUser);
    });
});
