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

/** Detect whether the API response uses { ok, data } wrapper or returns data directly */
function isWrappedResponse(raw: unknown): raw is { ok: boolean; message?: string; data?: unknown } {
    return typeof (raw as { ok?: unknown }).ok === 'boolean';
}

export class HttpAuthRepository implements IAuthRepository {
    constructor(
        private readonly httpClient: IHttpClient,
        private readonly storageService: IStorageService
    ) {}

    async login(credentials: LoginCredentials): Promise<User> {
        try {
            const response = await this.httpClient.post('/auth/login', credentials);
            const raw = response.data as Record<string, unknown>;

            let token: string | undefined;
            let userDTO: Record<string, unknown> | undefined;

            if (isWrappedResponse(raw)) {
                if (!raw.ok || !(raw.data as Record<string, unknown>)?.token) {
                    throw new InvalidCredentialsError(
                        (raw.message as string) || 'Error de autenticación: No se recibió un token válido'
                    );
                }
                const wrapped = raw.data as { token: string; user: Record<string, unknown> };
                token = wrapped.token;
                userDTO = wrapped.user;
            } else {
                // Direct response: { token, user } or { token, ... }
                token = raw.token as string | undefined;
                userDTO = (raw.user as Record<string, unknown>) || raw;
                if (!token) {
                    throw new InvalidCredentialsError(
                        'Error de autenticación: No se recibió un token válido'
                    );
                }
            }

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
            const raw = response.data as Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) {
                    throw new RegistrationError((raw.message as string) || 'Error en el registro');
                }

                const wrappedData = raw.data as Record<string, unknown> | undefined;
                if (wrappedData?.token) {
                    const { token, user: wrappedUser } = wrappedData as { token: string; user: Record<string, unknown> };
                    this.storageService.set('token', token);
                    const user = UserMapper.toDomain(wrappedUser as unknown as Parameters<typeof UserMapper.toDomain>[0]);
                    if (!user) throw new RegistrationError('Error mapping user data');
                    this.storageService.setJSON('user', user.toJSON());
                    return user;
                }

                const user = UserMapper.toDomain(wrappedData as unknown as Parameters<typeof UserMapper.toDomain>[0]);
                if (!user) throw new RegistrationError('Error mapping user data');
                return user;
            }

            // Direct response (unwrapped)
            if (raw.token) {
                this.storageService.set('token', raw.token as string);
                const userDTO = (raw.user as Record<string, unknown>) || raw;
                const user = UserMapper.toDomain(userDTO as unknown as Parameters<typeof UserMapper.toDomain>[0]);
                if (!user) throw new RegistrationError('Error mapping user data');
                this.storageService.setJSON('user', user.toJSON());
                return user;
            }

            const user = UserMapper.toDomain(raw as unknown as Parameters<typeof UserMapper.toDomain>[0]);
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
            const raw = response.data as Record<string, unknown>;

            let userDTO: Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new UnauthorizedError();
                userDTO = raw.data as Record<string, unknown>;
            } else {
                // Direct user object response
                userDTO = raw;
            }

            const user = UserMapper.toDomain(userDTO as unknown as Parameters<typeof UserMapper.toDomain>[0]);
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
