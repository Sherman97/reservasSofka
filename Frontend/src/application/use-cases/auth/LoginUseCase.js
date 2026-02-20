import { AuthenticationError } from '../../../core/domain/errors/AuthenticationError';

/**
 * LoginUseCase - Application Use Case
 * Handles user login business logic
 * Orchestrates the login process using the auth repository
 */
export class LoginUseCase {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    /**
     * Execute login use case
     * @param {object} credentials - User credentials
     * @param {string} credentials.email - User email
     * @param {string} credentials.password - User password
     * @returns {Promise<User>} Authenticated user
     * @throws {AuthenticationError} If login fails
     */
    async execute(credentials) {
        // Validate input
        if (!credentials.email || !credentials.password) {
            throw new AuthenticationError('Email y contraseña son requeridos', 'VALIDATION_ERROR');
        }

        // Validate email format (basic validation)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
            throw new AuthenticationError('Email inválido', 'VALIDATION_ERROR');
        }

        // Delegate to repository
        const user = await this.authRepository.login(credentials);

        return user;
    }
}
