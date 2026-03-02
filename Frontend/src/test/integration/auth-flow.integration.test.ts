/**
 * Integration Tests: Auth Flow
 * 
 * Tests de integración que verifican la interacción entre capas:
 * UseCase → Repository (mock HTTP) → Mapper → Entity
 * 
 * Estos tests validan que las capas se comunican correctamente
 * sin depender de servicios externos.
 */
import { describe, it, expect, vi } from 'vitest';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase';
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';
import { GetCurrentUserUseCase } from '../../application/use-cases/auth/GetCurrentUserUseCase';
import { User } from '../../core/domain/entities/User';
import { UserMapper } from '../../infrastructure/mappers/UserMapper';
import { AuthenticationError } from '../../core/domain/errors/AuthenticationError';
import type { IAuthRepository } from '../../core/ports/repositories/IAuthRepository';

describe('Integration: Auth Flow (UseCase + Mapper + Entity)', () => {
    /**
     * Simula un repositorio que usa el mapper internamente,
     * imitando lo que hace HttpAuthRepository
     */
    function createFakeAuthRepo(): IAuthRepository {
        const storage: Record<string, unknown> = {};

        return {
            async login(credentials) {
                // Simula respuesta del API mapeada a dominio
                const userDTO = { id: 'u1', email: credentials.email, name: 'Test User', role: 'user' };
                const user = UserMapper.toDomain(userDTO);
                if (!user) throw new AuthenticationError('Error mapping user');
                storage['token'] = 'fake-token';
                storage['user'] = user.toJSON();
                return user;
            },
            async register(userData) {
                const userDTO = { id: 'u2', email: userData.email, username: userData.name, role: 'user' };
                const user = UserMapper.toDomain(userDTO);
                if (!user) throw new AuthenticationError('Error mapping user');
                storage['token'] = 'fake-token';
                storage['user'] = user.toJSON();
                return user;
            },
            async logout() {
                delete storage['token'];
                delete storage['user'];
            },
            async getCurrentUser() {
                return this.getStoredUser()!;
            },
            isAuthenticated() {
                return !!storage['token'];
            },
            getStoredUser() {
                if (!storage['user']) return null;
                return User.fromJSON(storage['user'] as any);
            }
        };
    }

    it('login → mapper → entity flow completo', async () => {
        const repo = createFakeAuthRepo();
        const loginUseCase = new LoginUseCase(repo);

        const user = await loginUseCase.execute({ email: 'integ@test.com', password: '123456' });

        expect(user).toBeInstanceOf(User);
        expect(user.email).toBe('integ@test.com');
        expect(user.isValid()).toBe(true);
        expect(user.isRegularUser()).toBe(true);
    });

    it('register → mapper (username alias) → entity flow', async () => {
        const repo = createFakeAuthRepo();
        const registerUseCase = new RegisterUseCase(repo);

        const user = await registerUseCase.execute({
            email: 'new@test.com', password: '123456', name: 'New User'
        });

        // UserMapper debe haber usado username como fallback
        expect(user).toBeInstanceOf(User);
        expect(user.email).toBe('new@test.com');
        expect(user.name).toBe('New User');
    });

    it('login → getStoredUser flow completo', async () => {
        const repo = createFakeAuthRepo();
        const loginUseCase = new LoginUseCase(repo);
        const getCurrentUserUseCase = new GetCurrentUserUseCase(repo);

        // No hay usuario antes de login
        expect(getCurrentUserUseCase.execute()).toBeNull();

        // Login
        await loginUseCase.execute({ email: 'stored@test.com', password: '123456' });

        // Ahora debe haber un usuario almacenado
        const storedUser = getCurrentUserUseCase.execute();
        expect(storedUser).toBeInstanceOf(User);
        expect(storedUser!.email).toBe('stored@test.com');
    });

    it('login → logout → isAuthenticated flow completo', async () => {
        const repo = createFakeAuthRepo();
        const loginUseCase = new LoginUseCase(repo);
        const logoutUseCase = new LogoutUseCase(repo);

        // Login
        await loginUseCase.execute({ email: 'auth@test.com', password: '123456' });
        expect(logoutUseCase.isAuthenticated()).toBe(true);

        // Logout
        await logoutUseCase.execute();
        expect(logoutUseCase.isAuthenticated()).toBe(false);
    });

    it('login con email inválido debe fallar en el UseCase antes de llegar al repo', async () => {
        const repo = createFakeAuthRepo();
        const loginUseCase = new LoginUseCase(repo);

        await expect(loginUseCase.execute({ email: 'invalid', password: '123456' }))
            .rejects.toThrow(AuthenticationError);
    });
});
