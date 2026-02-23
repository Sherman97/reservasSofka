import { describe, it, expect } from 'vitest';
import {
    AuthenticationError,
    InvalidCredentialsError,
    TokenExpiredError,
    UnauthorizedError,
    RegistrationError,
} from './AuthenticationError';

describe('Domain Errors', () => {
    describe('AuthenticationError', () => {
        it('should create error with message and default code', () => {
            const err = new AuthenticationError('Test error');
            expect(err.message).toBe('Test error');
            expect(err.code).toBe('AUTH_ERROR');
            expect(err.name).toBe('AuthenticationError');
            expect(err).toBeInstanceOf(Error);
        });

        it('should accept custom code', () => {
            const err = new AuthenticationError('Custom', 'CUSTOM_CODE');
            expect(err.code).toBe('CUSTOM_CODE');
        });
    });

    describe('InvalidCredentialsError', () => {
        it('should use default message and code', () => {
            const err = new InvalidCredentialsError();
            expect(err.message).toBe('Email o contraseña inválidos');
            expect(err.code).toBe('INVALID_CREDENTIALS');
            expect(err).toBeInstanceOf(AuthenticationError);
        });

        it('should accept custom message', () => {
            const err = new InvalidCredentialsError('Credenciales malas');
            expect(err.message).toBe('Credenciales malas');
        });
    });

    describe('TokenExpiredError', () => {
        it('should use default message and code', () => {
            const err = new TokenExpiredError();
            expect(err.message).toContain('Sesión expirada');
            expect(err.code).toBe('TOKEN_EXPIRED');
            expect(err).toBeInstanceOf(AuthenticationError);
        });
    });

    describe('UnauthorizedError', () => {
        it('should use default message and code', () => {
            const err = new UnauthorizedError();
            expect(err.message).toBe('No autorizado');
            expect(err.code).toBe('UNAUTHORIZED');
            expect(err).toBeInstanceOf(AuthenticationError);
        });
    });

    describe('RegistrationError', () => {
        it('should use default message and code', () => {
            const err = new RegistrationError();
            expect(err.message).toBe('Error en el registro');
            expect(err.code).toBe('REGISTRATION_ERROR');
            expect(err).toBeInstanceOf(AuthenticationError);
        });

        it('should accept custom message', () => {
            const err = new RegistrationError('Email duplicado');
            expect(err.message).toBe('Email duplicado');
        });
    });
});
