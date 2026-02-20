import { IAuthRepository } from '../../core/ports/repositories/IAuthRepository';
import { User } from '../../core/domain/entities/User';
import { UserMapper } from '../mappers/UserMapper';
import {
    AuthenticationError,
    InvalidCredentialsError,
    RegistrationError,
    UnauthorizedError
} from '../../core/domain/errors/AuthenticationError';

/**
 * HttpAuthRepository - Repository Pattern implementation
 * Implements IAuthRepository using HTTP client
 * Handles authentication via REST API
 */
export class HttpAuthRepository extends IAuthRepository {
    constructor(httpClient, storageService) {
        super();
        this.httpClient = httpClient;
        this.storageService = storageService;
    }

    async login(credentials) {
        try {
            const response = await this.httpClient.post('/auth/login', credentials);

            // Validate response
            if (!response.data.ok || !response.data.data?.token) {
                throw new InvalidCredentialsError(
                    response.data.message || 'Error de autenticación: No se recibió un token válido'
                );
            }

            const { token, user: userDTO } = response.data.data;

            // Store token
            this.storageService.set('token', token);

            // Map DTO to domain entity
            const user = UserMapper.toDomain(userDTO);

            // Store user
            this.storageService.setJSON('user', user.toJSON());

            return user;
        } catch (error) {
            if (error instanceof AuthenticationError) {
                throw error;
            }

            // Handle HTTP errors
            if (error.status === 401) {
                throw new InvalidCredentialsError();
            }

            throw new AuthenticationError(
                error.message || 'Error de conexión',
                'CONNECTION_ERROR'
            );
        }
    }

    async register(userData) {
        try {
            const response = await this.httpClient.post('/auth/register', userData);

            if (!response.data.ok) {
                throw new RegistrationError(
                    response.data.message || 'Error en el registro'
                );
            }

            // If registration returns user with token, store it
            if (response.data.data?.token) {
                const { token, user: userDTO } = response.data.data;
                this.storageService.set('token', token);
                const user = UserMapper.toDomain(userDTO);
                this.storageService.setJSON('user', user.toJSON());
                return user;
            }

            // If no token, just return the created user
            return UserMapper.toDomain(response.data.data);
        } catch (error) {
            if (error instanceof AuthenticationError) {
                throw error;
            }

            throw new RegistrationError(
                error.message || 'Error de conexión'
            );
        }
    }

    async logout() {
        // Clear stored credentials
        this.storageService.remove('token');
        this.storageService.remove('user');
    }

    async getCurrentUser() {
        try {
            const response = await this.httpClient.get('/auth/me');

            if (!response.data.ok) {
                throw new UnauthorizedError();
            }

            const user = UserMapper.toDomain(response.data.data);

            // Update stored user
            this.storageService.setJSON('user', user.toJSON());

            return user;
        } catch (error) {
            if (error instanceof AuthenticationError) {
                throw error;
            }

            if (error.status === 401) {
                throw new UnauthorizedError();
            }

            throw new AuthenticationError(
                error.message || 'Error obteniendo usuario actual',
                'FETCH_USER_ERROR'
            );
        }
    }

    isAuthenticated() {
        return this.storageService.has('token');
    }

    getStoredUser() {
        const userJSON = this.storageService.getJSON('user');
        return userJSON ? User.fromJSON(userJSON) : null;
    }
}
