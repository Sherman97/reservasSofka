import type { IAuthRepository, RegisterData } from '../../../core/ports/repositories/IAuthRepository';
import type { User } from '../../../core/domain/entities/User';
import { RegistrationError } from '../../../core/domain/errors/AuthenticationError';

export class RegisterUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    async execute(userData: RegisterData): Promise<User> {
        if (!userData.email || !userData.password || !userData.name) {
            throw new RegistrationError('Email, contraseña y nombre son requeridos');
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@sofka\.com\.co$/i;
        if (!emailRegex.test(userData.email)) {
            throw new RegistrationError('El correo corporativo no cumple con el formato válido');
        }

        if (userData.password.length < 6) {
            throw new RegistrationError('La contraseña debe tener al menos 6 caracteres');
        }

        if (userData.name.trim().length === 0) {
            throw new RegistrationError('El nombre no puede estar vacío');
        }

        const user = await this.authRepository.register(userData);
        return user;
    }
}
