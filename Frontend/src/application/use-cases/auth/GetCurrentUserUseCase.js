/**
 * GetCurrentUserUseCase - Application Use Case
 * Retrieves the currently logged in user from storage
 */
export class GetCurrentUserUseCase {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    /**
     * Execute use case
     * @returns {User|null} Stored user entity or null
     */
    execute() {
        return this.authRepository.getStoredUser();
    }
}
