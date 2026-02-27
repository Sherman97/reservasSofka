import { describe, it, expect, vi } from 'vitest';
import { RegisterUseCase } from './RegisterUseCase';
import { RegistrationError } from '../../../core/domain/errors/AuthenticationError';
import { User } from '../../../core/domain/entities/User';
import type { IAuthRepository } from '../../../core/ports/repositories/IAuthRepository';

describe('RegisterUseCase', () => {
    const mockUser = new User({ id: 'u1', email: 'new@mail.com', name: 'New User', role: 'user' });

    const createMockRepo = (overrides: Partial<IAuthRepository> = {}): IAuthRepository => ({
        login: vi.fn(),
        register: vi.fn().mockResolvedValue(mockUser),
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        isAuthenticated: vi.fn(),
        getStoredUser: vi.fn(),
        ...overrides
    });

    it('debe registrar usuario con datos válidos', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);
        const result = await useCase.execute({ email: 'new@mail.com', password: '123456', name: 'New User' });
        expect(result).toBe(mockUser);
        expect(repo.register).toHaveBeenCalled();
    });

    it('debe lanzar error si email está vacío', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);
        await expect(useCase.execute({ email: '', password: '123456', name: 'Test' }))
            .rejects.toThrow(RegistrationError);
    });

    it('debe lanzar error si password está vacío', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);
        await expect(useCase.execute({ email: 'a@b.com', password: '', name: 'Test' }))
            .rejects.toThrow(RegistrationError);
    });

    it('debe lanzar error si name está vacío', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);
        await expect(useCase.execute({ email: 'a@b.com', password: '123456', name: '' }))
            .rejects.toThrow(RegistrationError);
    });

    it('debe lanzar error si email es inválido', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);
        await expect(useCase.execute({ email: 'invalid', password: '123456', name: 'Test' }))
            .rejects.toThrow(RegistrationError);
    });

    it('debe lanzar error si password tiene menos de 6 caracteres', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);
        await expect(useCase.execute({ email: 'a@b.com', password: '12345', name: 'Test' }))
            .rejects.toThrow(RegistrationError);
    });

    it('debe lanzar error si nombre es solo espacios', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);
        await expect(useCase.execute({ email: 'a@b.com', password: '123456', name: '   ' }))
            .rejects.toThrow(RegistrationError);
    });

    it('debe aceptar password de exactamente 6 caracteres', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);
        const result = await useCase.execute({ email: 'a@b.com', password: '123456', name: 'Test' });
        expect(result).toBe(mockUser);
    });
});
