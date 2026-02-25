/**
 * User - Domain Entity
 * Represents a user in the system with business logic
 * This is a rich domain model, not an anemic data structure
 */
export class User {
    constructor({ id, email, name, role = 'user' }) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
    }

    /**
     * Check if user is an administrator
     * @returns {boolean}
     */
    isAdmin() {
        return this.role === 'admin';
    }

    /**
     * Check if user is a regular user
     * @returns {boolean}
     */
    isRegularUser() {
        return this.role === 'user';
    }

    /**
     * Get user display name
     * @returns {string}
     */
    getDisplayName() {
        return this.name || this.email;
    }

    /**
     * Validate user data
     * @returns {boolean}
     */
    isValid() {
        return !!(this.id && this.email && this.name);
    }

    /**
     * Convert to JSON for serialization
     * @returns {object}
     */
    toJSON() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            role: this.role
        };
    }

    /**
     * Create User from JSON
     * @param {object} json - JSON object
     * @returns {User}
     */
    static fromJSON(json) {
        return new User(json);
    }
}
