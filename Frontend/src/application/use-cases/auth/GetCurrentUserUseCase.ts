import type { IAuthRepository } from '../../../core/ports/repositories/IAuthRepository';
import type { User } from '../../../core/domain/entities/User';

export class GetCurrentUserUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    execute(): User | null {
        return this.authRepository.getStoredUser();
    }
}
