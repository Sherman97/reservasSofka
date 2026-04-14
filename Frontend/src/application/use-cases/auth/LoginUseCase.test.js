import { describe, it, expect, vi } from 'vitest';
import { LoginUseCase } from './LoginUseCase';
import { AuthenticationError } from '../../../core/domain/errors/AuthenticationError';

describe('LoginUseCase', () => {
    const createMockRepo = (overrides = {}) => ({
        login: vi.fn().mockResolvedValue({ id: '1', email: 'test@empresa.com', name: 'Test' }),
        ...overrides,
    });

    it('should login successfully with valid credentials', async () => {
        const mockUser = { id: '1', email: 'user@empresa.com', name: 'User' };
        const repo = createMockRepo({ login: vi.fn().mockResolvedValue(mockUser) });
        const useCase = new LoginUseCase(repo);

        const result = await useCase.execute({ email: 'user@empresa.com', password: '123456' });

        expect(result).toEqual(mockUser);
        expect(repo.login).toHaveBeenCalledWith({ email: 'user@empresa.com', password: '123456' });
    });

    it('should throw AuthenticationError when email is missing', async () => {
        const repo = createMockRepo();
        const useCase = new LoginUseCase(repo);

        await expect(useCase.execute({ email: '', password: '123456' }))
            .rejects.toThrow(AuthenticationError);
        expect(repo.login).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationError when password is missing', async () => {
        const repo = createMockRepo();
        const useCase = new LoginUseCase(repo);

        await expect(useCase.execute({ email: 'a@b.com', password: '' }))
            .rejects.toThrow(AuthenticationError);
        expect(repo.login).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationError for invalid email format', async () => {
        const repo = createMockRepo();
        const useCase = new LoginUseCase(repo);

        await expect(useCase.execute({ email: 'invalid-email', password: '123456' }))
            .rejects.toThrow('Email inválido');
        expect(repo.login).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
        const repo = createMockRepo({
            login: vi.fn().mockRejectedValue(new Error('Network error')),
        });
        const useCase = new LoginUseCase(repo);

        await expect(useCase.execute({ email: 'a@b.com', password: '123456' }))
            .rejects.toThrow('Network error');
    });
});
