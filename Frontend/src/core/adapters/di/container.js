import { LocalStorageService } from '../../../infrastructure/storage/LocalStorageService';
import { HttpClientFactory } from '../../../infrastructure/http/clients/HttpClientFactory';
import { HttpAuthRepository } from '../../../infrastructure/repositories/HttpAuthRepository';
import { HttpLocationRepository } from '../../../infrastructure/repositories/HttpLocationRepository';
import { HttpInventoryRepository } from '../../../infrastructure/repositories/HttpInventoryRepository';
import { HttpReservationRepository } from '../../../infrastructure/repositories/HttpReservationRepository';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase';
import { LogoutUseCase } from '../../../application/use-cases/auth/LogoutUseCase';
import { RegisterUseCase } from '../../../application/use-cases/auth/RegisterUseCase';
import { GetLocationsUseCase } from '../../../application/use-cases/dashboard/GetLocationsUseCase';
import { GetInventoryUseCase } from '../../../application/use-cases/dashboard/GetInventoryUseCase';
import { CreateReservationUseCase } from '../../../application/use-cases/dashboard/CreateReservationUseCase';

/**
 * DIContainer - Singleton Pattern implementation
 * Central registry for all application dependencies
 * Implements dependency injection for loose coupling
 * 
 * Usage:
 *   import container from './container';
 *   const loginUseCase = container.get('loginUseCase');
 */
class DIContainer {
    static instance = null;

    constructor() {
        // Singleton: return existing instance if already created
        if (DIContainer.instance) {
            return DIContainer.instance;
        }

        this.dependencies = {};
        this._registerDependencies();
        DIContainer.instance = this;
    }

    /**
     * Register all application dependencies
     * This is where we wire up the entire dependency graph
     * @private
     */
    _registerDependencies() {
        // ===== INFRASTRUCTURE LAYER =====

        // Storage Service
        const storageService = new LocalStorageService();
        this.dependencies.storageService = storageService;

        // HTTP Clients (using Factory Pattern)
        const authClient = HttpClientFactory.createAuthClient(storageService);
        const bookingsClient = HttpClientFactory.createBookingsClient(storageService);
        const inventoryClient = HttpClientFactory.createInventoryClient(storageService);
        const locationsClient = HttpClientFactory.createLocationsClient(storageService);

        this.dependencies.authClient = authClient;
        this.dependencies.bookingsClient = bookingsClient;
        this.dependencies.inventoryClient = inventoryClient;
        this.dependencies.locationsClient = locationsClient;

        // ===== REPOSITORIES =====

        // Auth Repository
        const authRepository = new HttpAuthRepository(authClient, storageService);
        this.dependencies.authRepository = authRepository;

        // Dashboard Repositories
        const locationRepository = new HttpLocationRepository(locationsClient);
        const inventoryRepository = new HttpInventoryRepository(inventoryClient);
        const reservationRepository = new HttpReservationRepository(bookingsClient, storageService);

        this.dependencies.locationRepository = locationRepository;
        this.dependencies.inventoryRepository = inventoryRepository;
        this.dependencies.reservationRepository = reservationRepository;

        // ===== USE CASES =====

        // Auth Use Cases
        this.dependencies.loginUseCase = new LoginUseCase(authRepository);
        this.dependencies.logoutUseCase = new LogoutUseCase(authRepository);
        this.dependencies.registerUseCase = new RegisterUseCase(authRepository);

        // Dashboard Use Cases
        this.dependencies.getLocationsUseCase = new GetLocationsUseCase(locationRepository);
        this.dependencies.getInventoryUseCase = new GetInventoryUseCase(inventoryRepository);
        this.dependencies.createReservationUseCase = new CreateReservationUseCase(reservationRepository);
    }

    /**
     * Get dependency by name
     * @param {string} name - Dependency name
     * @returns {any} Dependency instance
     * @throws {Error} If dependency not found
     */
    get(name) {
        if (!this.dependencies[name]) {
            throw new Error(`Dependency not found: ${name}. Make sure it's registered in DIContainer.`);
        }
        return this.dependencies[name];
    }

    /**
     * Register a new dependency (useful for testing or dynamic registration)
     * @param {string} name - Dependency name
     * @param {any} instance - Dependency instance
     */
    register(name, instance) {
        this.dependencies[name] = instance;
    }

    /**
     * Check if dependency exists
     * @param {string} name - Dependency name
     * @returns {boolean}
     */
    has(name) {
        return !!this.dependencies[name];
    }

    /**
     * Reset container (useful for testing)
     * WARNING: This will remove all dependencies
     */
    reset() {
        this.dependencies = {};
        this._registerDependencies();
    }
}

// Export singleton instance
export default new DIContainer();
