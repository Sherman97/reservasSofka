import React, { createContext, useContext } from 'react';
import container from '../di/container';

/**
 * DependencyContext - React Context for dependency injection
 * Provides access to the DI container throughout the React component tree
 */
const DependencyContext = createContext(null);

/**
 * DependencyProvider - Facade Pattern implementation
 * Wraps the application to provide dependency injection
 * 
 * Usage:
 *   <DependencyProvider>
 *     <App />
 *   </DependencyProvider>
 */
export const DependencyProvider = ({ children }) => {
    return (
        <DependencyContext.Provider value={container}>
            {children}
        </DependencyContext.Provider>
    );
};

/**
 * useDependencies - Custom hook to access dependencies
 * Facade that exposes only necessary use cases to components
 * 
 * Usage:
 *   const { loginUseCase } = useDependencies();
 *   await loginUseCase.execute({ email, password });
 * 
 * @returns {object} Object containing all use cases
 */
export const useDependencies = () => {
    const container = useContext(DependencyContext);

    if (!container) {
        throw new Error('useDependencies must be used within DependencyProvider');
    }

    // Facade: Expose only use cases (not repositories or clients)
    // This provides a clean API and hides implementation details
    return {
        // Storage service (used by some hooks for direct access)
        storageService: container.has('storageService') ? container.get('storageService') : null,
        authClient: container.has('authClient') ? container.get('authClient') : null,

        // Auth Use Cases
        loginUseCase: container.has('loginUseCase') ? container.get('loginUseCase') : null,
        logoutUseCase: container.has('logoutUseCase') ? container.get('logoutUseCase') : null,
        registerUseCase: container.has('registerUseCase') ? container.get('registerUseCase') : null,

        // Dashboard Use Cases
        getLocationsUseCase: container.has('getLocationsUseCase') ? container.get('getLocationsUseCase') : null,
        getInventoryUseCase: container.has('getInventoryUseCase') ? container.get('getInventoryUseCase') : null,
        createReservationUseCase: container.has('createReservationUseCase') ? container.get('createReservationUseCase') : null,

        // Inventory use cases (will be added during migration)
        getEquipmentUseCase: container.has('getEquipmentUseCase') ? container.get('getEquipmentUseCase') : null,
    };
};

/**
 * useContainer - Hook to access the DI container directly
 * Use this only when you need low-level access to the container
 * Prefer useDependencies() for normal use
 * 
 * @returns {DIContainer} DI Container instance
 */
export const useContainer = () => {
    const container = useContext(DependencyContext);

    if (!container) {
        throw new Error('useContainer must be used within DependencyProvider');
    }

    return container;
};
