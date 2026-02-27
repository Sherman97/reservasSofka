import type { IAuthRepository } from '../../../core/ports/repositories/IAuthRepository';

export class LogoutUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    async execute(): Promise<void> {
        await this.authRepository.logout();
    }

    isAuthenticated(): boolean {
        return this.authRepository.isAuthenticated();
    }
}
