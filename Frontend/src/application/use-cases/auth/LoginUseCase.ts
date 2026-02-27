import type { IAuthRepository, LoginCredentials } from '../../../core/ports/repositories/IAuthRepository';
import type { User } from '../../../core/domain/entities/User';
import { AuthenticationError } from '../../../core/domain/errors/AuthenticationError';

export class LoginUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    async execute(credentials: LoginCredentials): Promise<User> {
        if (!credentials.email || !credentials.password) {
            throw new AuthenticationError('Email y contraseña son requeridos', 'VALIDATION_ERROR');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
            throw new AuthenticationError('Email inválido', 'VALIDATION_ERROR');
        }

        const user = await this.authRepository.login(credentials);
        return user;
    }
}
