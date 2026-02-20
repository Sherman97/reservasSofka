/**
 * AuthenticationError - Domain Error
 * Represents authentication-specific errors in the domain
 */
export class AuthenticationError extends Error {
    constructor(message, code = 'AUTH_ERROR') {
        super(message);
        this.name = 'AuthenticationError';
        this.code = code;
    }
}

/**
 * InvalidCredentialsError - Specific authentication error
 */
export class InvalidCredentialsError extends AuthenticationError {
    constructor(message = 'Email o contraseña inválidos') {
        super(message, 'INVALID_CREDENTIALS');
    }
}

/**
 * TokenExpiredError - Token expiration error
 */
export class TokenExpiredError extends AuthenticationError {
    constructor(message = 'Sesión expirada. Por favor inicia sesión nuevamente.') {
        super(message, 'TOKEN_EXPIRED');
    }
}

/**
 * UnauthorizedError - Unauthorized access error
 */
export class UnauthorizedError extends AuthenticationError {
    constructor(message = 'No autorizado') {
        super(message, 'UNAUTHORIZED');
    }
}

/**
 * RegistrationError - Registration specific error
 */
export class RegistrationError extends AuthenticationError {
    constructor(message = 'Error en el registro') {
        super(message, 'REGISTRATION_ERROR');
    }
}
