/**
 * IAuthRepository - Port (Interface)
 * Defines the contract for authentication data access
 * All authentication repository implementations must implement these methods
 */
export class IAuthRepository {
    /**
     * Authenticate user with credentials
     * @param {object} credentials - User credentials
     * @param {string} credentials.email - User email
     * @param {string} credentials.password - User password
     * @returns {Promise<User>} Authenticated user entity
     * @throws {AuthenticationError} If authentication fails
     */
    async login(credentials) {
        throw new Error('Method not implemented: login');
    }

    /**
     * Register a new user
     * @param {object} userData - User registration data
     * @param {string} userData.email - User email
     * @param {string} userData.password - User password
     * @param {string} userData.name - User name
     * @returns {Promise<User>} Registered user entity
     * @throws {RegistrationError} If registration fails
     */
    async register(userData) {
        throw new Error('Method not implemented: register');
    }

    /**
     * Logout current user
     * @returns {Promise<void>}
     */
    async logout() {
        throw new Error('Method not implemented: logout');
    }

    /**
     * Get current authenticated user
     * @returns {Promise<User>} Current user entity
     * @throws {UnauthorizedError} If not authenticated
     */
    async getCurrentUser() {
        throw new Error('Method not implemented: getCurrentUser');
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user has valid token
     */
    isAuthenticated() {
        throw new Error('Method not implemented: isAuthenticated');
    }

    /**
     * Get stored user from local storage
     * @returns {User|null} User or null if not found
     */
    getStoredUser() {
        throw new Error('Method not implemented: getStoredUser');
    }
}
