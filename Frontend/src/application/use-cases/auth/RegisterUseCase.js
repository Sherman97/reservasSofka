import { RegistrationError } from '../../../core/domain/errors/AuthenticationError';

/**
 * RegisterUseCase - Application Use Case
 * Handles user registration business logic
 * Orchestrates the registration process with validation
 */
export class RegisterUseCase {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    /**
     * Execute registration use case
     * @param {object} userData - User registration data
     * @param {string} userData.email - User email
     * @param {string} userData.password - User password
     * @param {string} userData.name - User name
     * @returns {Promise<User>} Registered user
     * @throws {RegistrationError} If registration fails
     */
    async execute(userData) {
        // Validate required fields
        if (!userData.email || !userData.password || !userData.name) {
            throw new RegistrationError('Email, contraseña y nombre son requeridos');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new RegistrationError('Email inválido');
        }

        // Validate password strength (minimum 6 characters)
        if (userData.password.length < 6) {
            throw new RegistrationError('La contraseña debe tener al menos 6 caracteres');
        }

        // Validate name (not empty)
        if (userData.name.trim().length === 0) {
            throw new RegistrationError('El nombre no puede estar vacío');
        }

        // Delegate to repository
        const user = await this.authRepository.register(userData);

        return user;
    }
}
