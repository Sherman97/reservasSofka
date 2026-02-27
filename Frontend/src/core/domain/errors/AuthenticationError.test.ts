import { describe, it, expect } from 'vitest';
import {
    AuthenticationError,
    InvalidCredentialsError,
    TokenExpiredError,
    UnauthorizedError,
    RegistrationError
} from './AuthenticationError';

describe('AuthenticationError', () => {
    it('debe crear error con mensaje y código', () => {
        const error = new AuthenticationError('test error', 'TEST_CODE');
        expect(error.message).toBe('test error');
        expect(error.code).toBe('TEST_CODE');
        expect(error.name).toBe('AuthenticationError');
    });

    it('debe usar AUTH_ERROR como código por defecto', () => {
        const error = new AuthenticationError('error');
        expect(error.code).toBe('AUTH_ERROR');
    });

    it('debe ser instancia de Error', () => {
        const error = new AuthenticationError('error');
        expect(error).toBeInstanceOf(Error);
    });
});

describe('InvalidCredentialsError', () => {
    it('debe crear error con mensaje por defecto', () => {
        const error = new InvalidCredentialsError();
        expect(error.message).toBe('Email o contraseña inválidos');
        expect(error.code).toBe('INVALID_CREDENTIALS');
    });

    it('debe aceptar mensaje personalizado', () => {
        const error = new InvalidCredentialsError('Custom message');
        expect(error.message).toBe('Custom message');
    });

    it('debe ser instancia de AuthenticationError', () => {
        const error = new InvalidCredentialsError();
        expect(error).toBeInstanceOf(AuthenticationError);
    });
});

describe('TokenExpiredError', () => {
    it('debe crear error con mensaje por defecto', () => {
        const error = new TokenExpiredError();
        expect(error.message).toBe('Sesión expirada. Por favor inicia sesión nuevamente.');
        expect(error.code).toBe('TOKEN_EXPIRED');
    });

    it('debe aceptar mensaje personalizado', () => {
        const error = new TokenExpiredError('Session expired');
        expect(error.message).toBe('Session expired');
    });

    it('debe ser instancia de AuthenticationError', () => {
        const error = new TokenExpiredError();
        expect(error).toBeInstanceOf(AuthenticationError);
    });
});

describe('UnauthorizedError', () => {
    it('debe crear error con mensaje por defecto', () => {
        const error = new UnauthorizedError();
        expect(error.message).toBe('No autorizado');
        expect(error.code).toBe('UNAUTHORIZED');
    });

    it('debe aceptar mensaje personalizado', () => {
        const error = new UnauthorizedError('Not allowed');
        expect(error.message).toBe('Not allowed');
    });

    it('debe ser instancia de AuthenticationError', () => {
        const error = new UnauthorizedError();
        expect(error).toBeInstanceOf(AuthenticationError);
    });
});

describe('RegistrationError', () => {
    it('debe crear error con mensaje por defecto', () => {
        const error = new RegistrationError();
        expect(error.message).toBe('Error en el registro');
        expect(error.code).toBe('REGISTRATION_ERROR');
    });

    it('debe aceptar mensaje personalizado', () => {
        const error = new RegistrationError('Email already exists');
        expect(error.message).toBe('Email already exists');
    });

    it('debe ser instancia de AuthenticationError', () => {
        const error = new RegistrationError();
        expect(error).toBeInstanceOf(AuthenticationError);
    });
});
