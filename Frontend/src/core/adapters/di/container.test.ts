import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all infrastructure dependencies BEFORE import
vi.mock('../../../infrastructure/storage/LocalStorageService', () => ({
    LocalStorageService: class MockLocalStorageService {
        get = vi.fn();
        set = vi.fn();
        remove = vi.fn();
        clear = vi.fn();
        has = vi.fn();
        getJSON = vi.fn();
        setJSON = vi.fn();
    }
}));

vi.mock('../../../infrastructure/http/clients/HttpClientFactory', () => ({
    HttpClientFactory: {
        createAuthClient: vi.fn(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(), addRequestInterceptor: vi.fn(), addResponseInterceptor: vi.fn() })),
        createBookingsClient: vi.fn(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(), addRequestInterceptor: vi.fn(), addResponseInterceptor: vi.fn() })),
        createInventoryClient: vi.fn(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(), addRequestInterceptor: vi.fn(), addResponseInterceptor: vi.fn() })),
        createLocationsClient: vi.fn(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(), addRequestInterceptor: vi.fn(), addResponseInterceptor: vi.fn() }))
    }
}));

vi.mock('../../../infrastructure/websocket/StompWebSocketService', () => ({
    StompWebSocketService: class MockStompWebSocketService {
        connect = vi.fn();
        disconnect = vi.fn();
        subscribe = vi.fn();
        isConnected = vi.fn();
    }
}));

vi.mock('../../../infrastructure/repositories/HttpAuthRepository', () => ({
    HttpAuthRepository: class { login = vi.fn(); logout = vi.fn(); register = vi.fn(); getCurrentUser = vi.fn(); }
}));
vi.mock('../../../infrastructure/repositories/HttpLocationRepository', () => ({
    HttpLocationRepository: class { getLocations = vi.fn(); assignInventory = vi.fn(); removeInventory = vi.fn(); }
}));
vi.mock('../../../infrastructure/repositories/HttpInventoryRepository', () => ({
    HttpInventoryRepository: class { getInventory = vi.fn(); }
}));
vi.mock('../../../infrastructure/repositories/HttpReservationRepository', () => ({
    HttpReservationRepository: class { createReservation = vi.fn(); getUserReservations = vi.fn(); cancelReservation = vi.fn(); getAvailability = vi.fn(); }
}));
vi.mock('../../../infrastructure/repositories/HttpDeliveryRepository', () => ({
    HttpDeliveryRepository: class { submitDelivery = vi.fn(); }
}));

// Mock all use cases
vi.mock('../../../application/use-cases/auth/LoginUseCase', () => ({
    LoginUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/auth/LogoutUseCase', () => ({
    LogoutUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/auth/RegisterUseCase', () => ({
    RegisterUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/auth/GetCurrentUserUseCase', () => ({
    GetCurrentUserUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/dashboard/GetLocationsUseCase', () => ({
    GetLocationsUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/dashboard/GetInventoryUseCase', () => ({
    GetInventoryUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/dashboard/CreateReservationUseCase', () => ({
    CreateReservationUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/dashboard/AssignInventoryUseCase', () => ({
    AssignInventoryUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/dashboard/RemoveInventoryUseCase', () => ({
    RemoveInventoryUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/reservations/GetUserReservationsUseCase', () => ({
    GetUserReservationsUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/reservations/CancelReservationUseCase', () => ({
    CancelReservationUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/dashboard/GetSpaceAvailabilityUseCase', () => ({
    GetSpaceAvailabilityUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/delivery/SubmitDeliveryUseCase', () => ({
    SubmitDeliveryUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/reservations/DeliverReservationUseCase', () => ({
    DeliverReservationUseCase: class { execute = vi.fn(); }
}));
vi.mock('../../../application/use-cases/reservations/ReturnReservationUseCase', () => ({
    ReturnReservationUseCase: class { execute = vi.fn(); }
}));

vi.stubEnv('VITE_API_URL', 'http://localhost:8080');

describe('DIContainer', () => {
    let container: any;

    beforeEach(async () => {
        vi.resetModules();
        const mod = await import('./container');
        container = mod.default;
    });

    it('debe crear instancia con todas las dependencias', () => {
        expect(container).toBeDefined();
    });

    it('get() debe retornar storageService', () => {
        expect(container.get('storageService')).toBeDefined();
    });

    it('get() debe retornar loginUseCase', () => {
        expect(container.get('loginUseCase')).toBeDefined();
    });

    it('get() debe retornar logoutUseCase', () => {
        expect(container.get('logoutUseCase')).toBeDefined();
    });

    it('get() debe retornar registerUseCase', () => {
        expect(container.get('registerUseCase')).toBeDefined();
    });

    it('get() debe retornar repositories', () => {
        expect(container.get('authRepository')).toBeDefined();
        expect(container.get('locationRepository')).toBeDefined();
        expect(container.get('inventoryRepository')).toBeDefined();
        expect(container.get('reservationRepository')).toBeDefined();
        expect(container.get('deliveryRepository')).toBeDefined();
    });

    it('get() debe retornar HTTP clients', () => {
        expect(container.get('authClient')).toBeDefined();
        expect(container.get('bookingsClient')).toBeDefined();
        expect(container.get('inventoryClient')).toBeDefined();
        expect(container.get('locationsClient')).toBeDefined();
    });

    it('get() debe retornar websocket service', () => {
        expect(container.get('webSocketService')).toBeDefined();
    });

    it('get() debe retornar use cases de dashboard', () => {
        expect(container.get('getLocationsUseCase')).toBeDefined();
        expect(container.get('getInventoryUseCase')).toBeDefined();
        expect(container.get('createReservationUseCase')).toBeDefined();
        expect(container.get('assignInventoryUseCase')).toBeDefined();
        expect(container.get('removeInventoryUseCase')).toBeDefined();
        expect(container.get('getSpaceAvailabilityUseCase')).toBeDefined();
    });

    it('get() debe retornar use cases de reservaciones', () => {
        expect(container.get('getUserReservationsUseCase')).toBeDefined();
        expect(container.get('cancelReservationUseCase')).toBeDefined();
        expect(container.get('deliverReservationUseCase')).toBeDefined();
        expect(container.get('returnReservationUseCase')).toBeDefined();
    });

    it('get() debe retornar submitDeliveryUseCase', () => {
        expect(container.get('submitDeliveryUseCase')).toBeDefined();
    });

    it('get() debe lanzar error para dependencia inexistente', () => {
        expect(() => container.get('nonexistent' as any)).toThrow('Dependency not found');
    });

    it('has() debe retornar true para dependencias registradas', () => {
        expect(container.has('storageService')).toBe(true);
        expect(container.has('loginUseCase')).toBe(true);
    });

    it('register() debe registrar nueva dependencia', () => {
        const custom = { execute: vi.fn() };
        container.register('loginUseCase', custom);
        expect(container.get('loginUseCase')).toBe(custom);
    });

    it('reset() debe re-registrar todas las dependencias', () => {
        container.reset();
        expect(container.get('storageService')).toBeDefined();
        expect(container.get('loginUseCase')).toBeDefined();
    });
});
