import type { IAuthRepository, LoginCredentials, RegisterData } from '../../core/ports/repositories/IAuthRepository';
import type { IHttpClient } from '../../core/ports/services/IHttpClient';
import type { IStorageService } from '../../core/ports/services/IStorageService';
import { User } from '../../core/domain/entities/User';
import { UserMapper } from '../mappers/UserMapper';
import {
    AuthenticationError,
    InvalidCredentialsError,
    RegistrationError,
    UnauthorizedError
} from '../../core/domain/errors/AuthenticationError';

export class HttpAuthRepository implements IAuthRepository {
    constructor(
        private readonly httpClient: IHttpClient,
        private readonly storageService: IStorageService
    ) {}

    async login(credentials: LoginCredentials): Promise<User> {
        try {
            const response = await this.httpClient.post('/auth/login', credentials);
            const data = response.data as { ok: boolean; message?: string; data?: { token: string; user: Record<string, unknown> } };

            if (!data.ok || !data.data?.token) {
                throw new InvalidCredentialsError(
                    data.message || 'Error de autenticación: No se recibió un token válido'
                );
            }

            const { token, user: userDTO } = data.data;
            this.storageService.set('token', token);
            const user = UserMapper.toDomain(userDTO as unknown as Parameters<typeof UserMapper.toDomain>[0]);
            if (!user) throw new AuthenticationError('Error mapping user data');
            this.storageService.setJSON('user', user.toJSON());
            return user;
        } catch (error) {
            if (error instanceof AuthenticationError) throw error;
            if ((error as { status?: number }).status === 401) throw new InvalidCredentialsError();
            throw new AuthenticationError(
                (error as Error).message || 'Error de conexión', 'CONNECTION_ERROR'
            );
        }
    }

    async register(userData: RegisterData): Promise<User> {
        try {
            const response = await this.httpClient.post('/auth/register', userData);
            const data = response.data as { ok: boolean; message?: string; data?: { token?: string; user?: Record<string, unknown> } & Record<string, unknown> };

            if (!data.ok) {
                throw new RegistrationError(data.message || 'Error en el registro');
            }

            if (data.data?.token) {
                const { token, user: userDTO } = data.data as { token: string; user: Record<string, unknown> };
                this.storageService.set('token', token);
                const user = UserMapper.toDomain(userDTO as unknown as Parameters<typeof UserMapper.toDomain>[0]);
                if (!user) throw new RegistrationError('Error mapping user data');
                this.storageService.setJSON('user', user.toJSON());
                return user;
            }

            const user = UserMapper.toDomain(data.data as unknown as Parameters<typeof UserMapper.toDomain>[0]);
            if (!user) throw new RegistrationError('Error mapping user data');
            return user;
        } catch (error) {
            if (error instanceof AuthenticationError) throw error;
            throw new RegistrationError((error as Error).message || 'Error de conexión');
        }
    }

    async logout(): Promise<void> {
        this.storageService.remove('token');
        this.storageService.remove('user');
    }

    async getCurrentUser(): Promise<User> {
        try {
            const response = await this.httpClient.get('/auth/me');
            const data = response.data as { ok: boolean; data?: Record<string, unknown> };

            if (!data.ok) throw new UnauthorizedError();

            const user = UserMapper.toDomain(data.data as unknown as Parameters<typeof UserMapper.toDomain>[0]);
            if (!user) throw new UnauthorizedError();
            this.storageService.setJSON('user', user.toJSON());
            return user;
        } catch (error) {
            if (error instanceof AuthenticationError) throw error;
            if ((error as { status?: number }).status === 401) throw new UnauthorizedError();
            throw new AuthenticationError(
                (error as Error).message || 'Error obteniendo usuario actual', 'FETCH_USER_ERROR'
            );
        }
    }

    isAuthenticated(): boolean {
        return this.storageService.has('token');
    }

    getStoredUser(): User | null {
        const userJSON = this.storageService.getJSON<Record<string, unknown>>('user');
        return userJSON ? User.fromJSON(userJSON as unknown as Parameters<typeof User.fromJSON>[0]) : null;
    }
}
