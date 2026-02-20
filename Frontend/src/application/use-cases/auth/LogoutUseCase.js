/**
 * LogoutUseCase - Application Use Case
 * Handles user logout business logic
 * Orchestrates the logout process
 */
export class LogoutUseCase {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    /**
     * Execute logout use case
     * @returns {Promise<void>}
     */
    async execute() {
        // Delegate to repository
        await this.authRepository.logout();
    }

    /**
     * Check if user is currently authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.authRepository.isAuthenticated();
    }
}
