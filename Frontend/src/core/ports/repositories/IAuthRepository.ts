import type { User } from '../../domain/entities/User';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

/**
 * IAuthRepository - Port (Interface)
 * Defines the contract for authentication data access
 */
export interface IAuthRepository {
    login(credentials: LoginCredentials): Promise<User>;
    register(userData: RegisterData): Promise<User>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User>;
    isAuthenticated(): boolean;
    getStoredUser(): User | null;
}
