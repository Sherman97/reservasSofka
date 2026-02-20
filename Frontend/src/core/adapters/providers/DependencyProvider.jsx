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
 */
export const DependencyProvider = ({ children }) => {
    return (
        <DependencyContext.Provider value={container}>
            {children}
        </DependencyContext.Provider>
    );
};

/**
 * useContainer - Internal hook to access the DI container
 * @returns {DIContainer} DI Container instance
 */
const useContainer = () => {
    const context = useContext(DependencyContext);
    if (!context) {
        throw new Error('Dependency hooks must be used within DependencyProvider');
    }
    return context;
};

/**
 * useAuthDependencies - Module-specific hook for Auth use cases
 */
export const useAuthDependencies = () => {
    const container = useContainer();
    return {
        loginUseCase: container.get('loginUseCase'),
        logoutUseCase: container.get('logoutUseCase'),
        registerUseCase: container.get('registerUseCase'),
        getCurrentUserUseCase: container.get('getCurrentUserUseCase'),
    };
};

/**
 * useReservationDependencies - Module-specific hook for Reservation use cases
 */
export const useReservationDependencies = () => {
    const container = useContainer();
    return {
        getLocationsUseCase: container.get('getLocationsUseCase'),
        getInventoryUseCase: container.get('getInventoryUseCase'),
        createReservationUseCase: container.get('createReservationUseCase'),
        getUserReservationsUseCase: container.get('getUserReservationsUseCase'),
        cancelReservationUseCase: container.get('cancelReservationUseCase'),
        getSpaceAvailabilityUseCase: container.get('getSpaceAvailabilityUseCase'),
        webSocketService: container.get('webSocketService'),
    };
};

/**
 * @deprecated Use useAuthDependencies or useReservationDependencies instead
 * Provided for backward compatibility during migration phases
 */
export const useDependencies = () => {
    const container = useContainer();
    return {
        loginUseCase: container.get('loginUseCase'),
        logoutUseCase: container.get('logoutUseCase'),
        registerUseCase: container.get('registerUseCase'),
        getCurrentUserUseCase: container.get('getCurrentUserUseCase'),
        getLocationsUseCase: container.get('getLocationsUseCase'),
        getInventoryUseCase: container.get('getInventoryUseCase'),
        createReservationUseCase: container.get('createReservationUseCase'),
        getUserReservationsUseCase: container.get('getUserReservationsUseCase'),
        cancelReservationUseCase: container.get('cancelReservationUseCase'),
    };
};
