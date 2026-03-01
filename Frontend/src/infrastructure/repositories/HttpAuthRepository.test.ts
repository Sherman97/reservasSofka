import { describe, it, expect, vi } from 'vitest';
import { HttpAuthRepository } from './HttpAuthRepository';
import { User } from '../../core/domain/entities/User';
import { InvalidCredentialsError, RegistrationError, UnauthorizedError, AuthenticationError } from '../../core/domain/errors/AuthenticationError';
import type { IHttpClient } from '../../core/ports/services/IHttpClient';
import type { IStorageService } from '../../core/ports/services/IStorageService';

describe('HttpAuthRepository', () => {
    function createMockHttpClient(overrides: Partial<IHttpClient> = {}): IHttpClient {
        return {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            patch: vi.fn(),
            delete: vi.fn(),
            addRequestInterceptor: vi.fn(),
            addResponseInterceptor: vi.fn(),
            ...overrides
        };
    }

    function createMockStorage(): IStorageService {
        const store: Record<string, string> = {};
        return {
            get: vi.fn((key: string) => store[key] ?? null),
            set: vi.fn((key: string, value: string) => { store[key] = value; }),
            remove: vi.fn((key: string) => { delete store[key]; }),
            clear: vi.fn(),
            has: vi.fn((key: string) => key in store),
            getJSON: vi.fn((key: string) => store[key] ? JSON.parse(store[key]) : null),
            setJSON: vi.fn((key: string, value: unknown) => { store[key] = JSON.stringify(value); })
        };
    }

    describe('login()', () => {
        it('debe hacer login exitoso y devolver User', async () => {
            const httpClient = createMockHttpClient({
                post: vi.fn().mockResolvedValue({
                    data: { ok: true, data: { token: 'abc123', user: { id: 'u1', email: 'a@b.com', name: 'Test' } } },
                    status: 200
                })
            });
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(httpClient, storage);

            const user = await repo.login({ email: 'a@b.com', password: '123456' });
            expect(user).toBeInstanceOf(User);
            expect(user.email).toBe('a@b.com');
            expect(storage.set).toHaveBeenCalledWith('token', 'abc123');
        });

        it('debe lanzar InvalidCredentialsError si ok es false', async () => {
            const httpClient = createMockHttpClient({
                post: vi.fn().mockResolvedValue({
                    data: { ok: false, message: 'Invalid credentials' },
                    status: 200
                })
            });
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(httpClient, storage);

            await expect(repo.login({ email: 'a@b.com', password: 'wrong' }))
                .rejects.toThrow(InvalidCredentialsError);
        });

        it('debe lanzar InvalidCredentialsError si no hay token', async () => {
            const httpClient = createMockHttpClient({
                post: vi.fn().mockResolvedValue({
                    data: { ok: true, data: {} },
                    status: 200
                })
            });
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(httpClient, storage);

            await expect(repo.login({ email: 'a@b.com', password: '123' }))
                .rejects.toThrow(InvalidCredentialsError);
        });

        it('debe lanzar InvalidCredentialsError si status 401', async () => {
            const httpClient = createMockHttpClient({
                post: vi.fn().mockRejectedValue({ status: 401 })
            });
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(httpClient, storage);

            await expect(repo.login({ email: 'a@b.com', password: '123' }))
                .rejects.toThrow(InvalidCredentialsError);
        });

        it('debe lanzar AuthenticationError genérico para otros errores', async () => {
            const httpClient = createMockHttpClient({
                post: vi.fn().mockRejectedValue(new Error('Network error'))
            });
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(httpClient, storage);

            await expect(repo.login({ email: 'a@b.com', password: '123' }))
                .rejects.toThrow(AuthenticationError);
        });
    });

    describe('register()', () => {
        it('debe registrar exitosamente con token', async () => {
            const httpClient = createMockHttpClient({
                post: vi.fn().mockResolvedValue({
                    data: { ok: true, data: { token: 'newtoken', user: { id: 'u2', email: 'new@b.com', name: 'New' } } },
                    status: 201
                })
            });
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(httpClient, storage);

            const user = await repo.register({ email: 'new@b.com', password: '123456', name: 'New' });
            expect(user).toBeInstanceOf(User);
            expect(storage.set).toHaveBeenCalledWith('token', 'newtoken');
        });

        it('debe registrar exitosamente sin token', async () => {
            const httpClient = createMockHttpClient({
                post: vi.fn().mockResolvedValue({
                    data: { ok: true, data: { id: 'u3', email: 'no-token@b.com', name: 'NoToken' } },
                    status: 201
                })
            });
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(httpClient, storage);

            const user = await repo.register({ email: 'no-token@b.com', password: '123456', name: 'NoToken' });
            expect(user).toBeInstanceOf(User);
        });

        it('debe lanzar RegistrationError si ok es false', async () => {
            const httpClient = createMockHttpClient({
                post: vi.fn().mockResolvedValue({
                    data: { ok: false, message: 'Email already exists' },
                    status: 200
                })
            });
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(httpClient, storage);

            await expect(repo.register({ email: 'a@b.com', password: '123456', name: 'Test' }))
                .rejects.toThrow(RegistrationError);
        });

        it('debe lanzar RegistrationError para errores de red', async () => {
            const httpClient = createMockHttpClient({
                post: vi.fn().mockRejectedValue(new Error('Network error'))
            });
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(httpClient, storage);

            await expect(repo.register({ email: 'a@b.com', password: '123456', name: 'Test' }))
                .rejects.toThrow(RegistrationError);
        });
    });

    describe('logout()', () => {
        it('debe remover token y user del storage', async () => {
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(createMockHttpClient(), storage);

            await repo.logout();
            expect(storage.remove).toHaveBeenCalledWith('token');
            expect(storage.remove).toHaveBeenCalledWith('user');
        });
    });

    describe('getCurrentUser()', () => {
        it('debe retornar el usuario actual', async () => {
            const httpClient = createMockHttpClient({
                get: vi.fn().mockResolvedValue({
                    data: { ok: true, data: { id: 'u1', email: 'a@b.com', name: 'Current' } },
                    status: 200
                })
            });
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(httpClient, storage);

            const user = await repo.getCurrentUser();
            expect(user).toBeInstanceOf(User);
            expect(user.name).toBe('Current');
        });

        it('debe lanzar UnauthorizedError si ok es false', async () => {
            const httpClient = createMockHttpClient({
                get: vi.fn().mockResolvedValue({
                    data: { ok: false },
                    status: 200
                })
            });
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(httpClient, storage);

            await expect(repo.getCurrentUser()).rejects.toThrow(UnauthorizedError);
        });

        it('debe lanzar UnauthorizedError para status 401', async () => {
            const httpClient = createMockHttpClient({
                get: vi.fn().mockRejectedValue({ status: 401 })
            });
            const storage = createMockStorage();
            const repo = new HttpAuthRepository(httpClient, storage);

            await expect(repo.getCurrentUser()).rejects.toThrow(UnauthorizedError);
        });
    });

    describe('isAuthenticated()', () => {
        it('debe retornar true si hay token', () => {
            const storage = createMockStorage();
            vi.mocked(storage.has).mockReturnValue(true);
            const repo = new HttpAuthRepository(createMockHttpClient(), storage);
            expect(repo.isAuthenticated()).toBe(true);
        });

        it('debe retornar false si no hay token', () => {
            const storage = createMockStorage();
            vi.mocked(storage.has).mockReturnValue(false);
            const repo = new HttpAuthRepository(createMockHttpClient(), storage);
            expect(repo.isAuthenticated()).toBe(false);
        });
    });

    describe('getStoredUser()', () => {
        it('debe retornar User si hay datos almacenados', () => {
            const storage = createMockStorage();
            vi.mocked(storage.getJSON).mockReturnValue({ id: 'u1', email: 'a@b.com', name: 'Stored', role: 'user' });
            const repo = new HttpAuthRepository(createMockHttpClient(), storage);
            const user = repo.getStoredUser();
            expect(user).toBeInstanceOf(User);
            expect(user!.email).toBe('a@b.com');
        });

        it('debe retornar null si no hay datos almacenados', () => {
            const storage = createMockStorage();
            vi.mocked(storage.getJSON).mockReturnValue(null);
            const repo = new HttpAuthRepository(createMockHttpClient(), storage);
            expect(repo.getStoredUser()).toBeNull();
        });
    });
});
