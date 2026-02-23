/**
 * IAuthRepository - Port (Interface)
 * Defines the contract for authentication data access
 * All authentication repository implementations must implement these methods
 */
export class IAuthRepository {
    /**
     * Authenticate user with credentials
     * @param {object} _credentials - User credentials
     * @param {string} _credentials.email - User email
     * @param {string} _credentials.password - User password
     * @returns {Promise<User>} Authenticated user entity
     * @throws {AuthenticationError} If authentication fails
     */
    async login(_credentials) {
        throw new Error('Method not implemented: login');
    }

    /**
     * Register a new user
     * @param {object} _userData - User registration data
     * @param {string} _userData.email - User email
     * @param {string} _userData.password - User password
     * @param {string} _userData.name - User name
     * @returns {Promise<User>} Registered user entity
     * @throws {RegistrationError} If registration fails
     */
    async register(_userData) {
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
