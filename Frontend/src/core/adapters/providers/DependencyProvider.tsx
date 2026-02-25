import React, { createContext, useContext, type ReactNode } from 'react';
import container from '../di/container';
import type { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase';
import type { LogoutUseCase } from '../../../application/use-cases/auth/LogoutUseCase';
import type { RegisterUseCase } from '../../../application/use-cases/auth/RegisterUseCase';
import type { GetCurrentUserUseCase } from '../../../application/use-cases/auth/GetCurrentUserUseCase';
import type { GetLocationsUseCase } from '../../../application/use-cases/dashboard/GetLocationsUseCase';
import type { GetInventoryUseCase } from '../../../application/use-cases/dashboard/GetInventoryUseCase';
import type { CreateReservationUseCase } from '../../../application/use-cases/dashboard/CreateReservationUseCase';
import type { GetUserReservationsUseCase } from '../../../application/use-cases/reservations/GetUserReservationsUseCase';
import type { CancelReservationUseCase } from '../../../application/use-cases/reservations/CancelReservationUseCase';
import type { GetSpaceAvailabilityUseCase } from '../../../application/use-cases/dashboard/GetSpaceAvailabilityUseCase';
import type { AssignInventoryUseCase } from '../../../application/use-cases/dashboard/AssignInventoryUseCase';
import type { RemoveInventoryUseCase } from '../../../application/use-cases/dashboard/RemoveInventoryUseCase';
import type { IWebSocketService } from '../../../core/ports/services/IWebSocketService';

type ContainerType = typeof container;

const DependencyContext = createContext<ContainerType | null>(null);

interface DependencyProviderProps {
    children: ReactNode;
}

export const DependencyProvider: React.FC<DependencyProviderProps> = ({ children }) => {
    return (
        <DependencyContext.Provider value={container}>
            {children}
        </DependencyContext.Provider>
    );
};

const useContainer = (): ContainerType => {
    const context = useContext(DependencyContext);
    if (!context) {
        throw new Error('Dependency hooks must be used within DependencyProvider');
    }
    return context;
};

export interface AuthDependencies {
    loginUseCase: LoginUseCase;
    logoutUseCase: LogoutUseCase;
    registerUseCase: RegisterUseCase;
    getCurrentUserUseCase: GetCurrentUserUseCase;
}

export const useAuthDependencies = (): AuthDependencies => {
    const c = useContainer();
    return {
        loginUseCase: c.get('loginUseCase'),
        logoutUseCase: c.get('logoutUseCase'),
        registerUseCase: c.get('registerUseCase'),
        getCurrentUserUseCase: c.get('getCurrentUserUseCase'),
    };
};

export interface ReservationDependencies {
    getLocationsUseCase: GetLocationsUseCase;
    getInventoryUseCase: GetInventoryUseCase;
    createReservationUseCase: CreateReservationUseCase;
    getUserReservationsUseCase: GetUserReservationsUseCase;
    cancelReservationUseCase: CancelReservationUseCase;
    getSpaceAvailabilityUseCase: GetSpaceAvailabilityUseCase;
    webSocketService: IWebSocketService;
}

export const useReservationDependencies = (): ReservationDependencies => {
    const c = useContainer();
    return {
        getLocationsUseCase: c.get('getLocationsUseCase'),
        getInventoryUseCase: c.get('getInventoryUseCase'),
        createReservationUseCase: c.get('createReservationUseCase'),
        getUserReservationsUseCase: c.get('getUserReservationsUseCase'),
        cancelReservationUseCase: c.get('cancelReservationUseCase'),
        getSpaceAvailabilityUseCase: c.get('getSpaceAvailabilityUseCase'),
        webSocketService: c.get('webSocketService'),
    };
};

export interface DashboardDependencies {
    getLocationsUseCase: GetLocationsUseCase;
    getInventoryUseCase: GetInventoryUseCase;
    assignInventoryUseCase: AssignInventoryUseCase;
    removeInventoryUseCase: RemoveInventoryUseCase;
}

export const useDashboardDependencies = (): DashboardDependencies => {
    const c = useContainer();
    return {
        getLocationsUseCase: c.get('getLocationsUseCase'),
        getInventoryUseCase: c.get('getInventoryUseCase'),
        assignInventoryUseCase: c.get('assignInventoryUseCase'),
        removeInventoryUseCase: c.get('removeInventoryUseCase'),
    };
};

export interface AllDependencies {
    loginUseCase: LoginUseCase;
    logoutUseCase: LogoutUseCase;
    registerUseCase: RegisterUseCase;
    getCurrentUserUseCase: GetCurrentUserUseCase;
    getLocationsUseCase: GetLocationsUseCase;
    getInventoryUseCase: GetInventoryUseCase;
    createReservationUseCase: CreateReservationUseCase;
    getUserReservationsUseCase: GetUserReservationsUseCase;
    cancelReservationUseCase: CancelReservationUseCase;
}

/** @deprecated Use useAuthDependencies or useReservationDependencies instead */
export const useDependencies = (): AllDependencies => {
    const c = useContainer();
    return {
        loginUseCase: c.get('loginUseCase'),
        logoutUseCase: c.get('logoutUseCase'),
        registerUseCase: c.get('registerUseCase'),
        getCurrentUserUseCase: c.get('getCurrentUserUseCase'),
        getLocationsUseCase: c.get('getLocationsUseCase'),
        getInventoryUseCase: c.get('getInventoryUseCase'),
        createReservationUseCase: c.get('createReservationUseCase'),
        getUserReservationsUseCase: c.get('getUserReservationsUseCase'),
        cancelReservationUseCase: c.get('cancelReservationUseCase'),
    };
};
