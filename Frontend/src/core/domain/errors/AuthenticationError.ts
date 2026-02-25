export class AuthenticationError extends Error {
    public readonly code: string;

    constructor(message: string, code: string = 'AUTH_ERROR') {
        super(message);
        this.name = 'AuthenticationError';
        this.code = code;
    }
}

export class InvalidCredentialsError extends AuthenticationError {
    constructor(message: string = 'Email o contraseña inválidos') {
        super(message, 'INVALID_CREDENTIALS');
    }
}

export class TokenExpiredError extends AuthenticationError {
    constructor(message: string = 'Sesión expirada. Por favor inicia sesión nuevamente.') {
        super(message, 'TOKEN_EXPIRED');
    }
}

export class UnauthorizedError extends AuthenticationError {
    constructor(message: string = 'No autorizado') {
        super(message, 'UNAUTHORIZED');
    }
}

export class RegistrationError extends AuthenticationError {
    constructor(message: string = 'Error en el registro') {
        super(message, 'REGISTRATION_ERROR');
    }
}
