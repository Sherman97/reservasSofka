import type { IStorageService } from '../../../core/ports/services/IStorageService';
import type { IWebSocketService } from '../../../core/ports/services/IWebSocketService';
import type { IHttpClient } from '../../../core/ports/services/IHttpClient';
import type { IAuthRepository } from '../../../core/ports/repositories/IAuthRepository';
import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';
import type { ILocationRepository } from '../../../core/ports/repositories/ILocationRepository';
import type { IInventoryRepository } from '../../../core/ports/repositories/IInventoryRepository';
import type { IDeliveryRepository } from '../../../core/ports/repositories/IDeliveryRepository';

import { LocalStorageService } from '../../../infrastructure/storage/LocalStorageService';
import { HttpClientFactory } from '../../../infrastructure/http/clients/HttpClientFactory';
import { HttpAuthRepository } from '../../../infrastructure/repositories/HttpAuthRepository';
import { HttpLocationRepository } from '../../../infrastructure/repositories/HttpLocationRepository';
import { HttpInventoryRepository } from '../../../infrastructure/repositories/HttpInventoryRepository';
import { HttpReservationRepository } from '../../../infrastructure/repositories/HttpReservationRepository';
import { HttpDeliveryRepository } from '../../../infrastructure/repositories/HttpDeliveryRepository';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase';
import { LogoutUseCase } from '../../../application/use-cases/auth/LogoutUseCase';
import { RegisterUseCase } from '../../../application/use-cases/auth/RegisterUseCase';
import { GetLocationsUseCase } from '../../../application/use-cases/dashboard/GetLocationsUseCase';
import { GetInventoryUseCase } from '../../../application/use-cases/dashboard/GetInventoryUseCase';
import { CreateReservationUseCase } from '../../../application/use-cases/dashboard/CreateReservationUseCase';
import { AssignInventoryUseCase } from '../../../application/use-cases/dashboard/AssignInventoryUseCase';
import { RemoveInventoryUseCase } from '../../../application/use-cases/dashboard/RemoveInventoryUseCase';
import { GetUserReservationsUseCase } from '../../../application/use-cases/reservations/GetUserReservationsUseCase';
import { CancelReservationUseCase } from '../../../application/use-cases/reservations/CancelReservationUseCase';
import { GetCurrentUserUseCase } from '../../../application/use-cases/auth/GetCurrentUserUseCase';
import { GetSpaceAvailabilityUseCase } from '../../../application/use-cases/dashboard/GetSpaceAvailabilityUseCase';
import { SubmitDeliveryUseCase } from '../../../application/use-cases/delivery/SubmitDeliveryUseCase';
import { DeliverReservationUseCase } from '../../../application/use-cases/reservations/DeliverReservationUseCase';
import { ReturnReservationUseCase } from '../../../application/use-cases/reservations/ReturnReservationUseCase';
import { StompWebSocketService } from '../../../infrastructure/websocket/StompWebSocketService';

export interface DependencyMap {
    storageService: IStorageService;
    webSocketService: IWebSocketService;
    authClient: IHttpClient;
    bookingsClient: IHttpClient;
    inventoryClient: IHttpClient;
    locationsClient: IHttpClient;
    authRepository: IAuthRepository;
    locationRepository: ILocationRepository;
    inventoryRepository: IInventoryRepository;
    reservationRepository: IReservationRepository;
    deliveryRepository: IDeliveryRepository;
    loginUseCase: LoginUseCase;
    logoutUseCase: LogoutUseCase;
    registerUseCase: RegisterUseCase;
    getCurrentUserUseCase: GetCurrentUserUseCase;
    getLocationsUseCase: GetLocationsUseCase;
    getInventoryUseCase: GetInventoryUseCase;
    createReservationUseCase: CreateReservationUseCase;
    assignInventoryUseCase: AssignInventoryUseCase;
    removeInventoryUseCase: RemoveInventoryUseCase;
    getUserReservationsUseCase: GetUserReservationsUseCase;
    cancelReservationUseCase: CancelReservationUseCase;
    getSpaceAvailabilityUseCase: GetSpaceAvailabilityUseCase;
    submitDeliveryUseCase: SubmitDeliveryUseCase;
    deliverReservationUseCase: DeliverReservationUseCase;
    returnReservationUseCase: ReturnReservationUseCase;
}

class DIContainer {
    private static instance: DIContainer | null = null;
    private dependencies: Partial<DependencyMap> = {};

    constructor() {
        if (DIContainer.instance) {
            return DIContainer.instance;
        }
        this._registerDependencies();
        DIContainer.instance = this;
    }

    private _registerDependencies(): void {
        const storageService = new LocalStorageService();
        this.dependencies.storageService = storageService;

        const authClient = HttpClientFactory.createAuthClient(storageService);
        const bookingsClient = HttpClientFactory.createBookingsClient(storageService);
        const inventoryClient = HttpClientFactory.createInventoryClient(storageService);
        const locationsClient = HttpClientFactory.createLocationsClient(storageService);

        const gatewayUrl = import.meta.env.VITE_API_URL;
        const webSocketService = new StompWebSocketService(gatewayUrl);
        this.dependencies.webSocketService = webSocketService;

        this.dependencies.authClient = authClient;
        this.dependencies.bookingsClient = bookingsClient;
        this.dependencies.inventoryClient = inventoryClient;
        this.dependencies.locationsClient = locationsClient;

        const authRepository = new HttpAuthRepository(authClient, storageService);
        this.dependencies.authRepository = authRepository;

        const locationRepository = new HttpLocationRepository(locationsClient);
        const inventoryRepository = new HttpInventoryRepository(inventoryClient);
        const reservationRepository = new HttpReservationRepository(bookingsClient, storageService);

        this.dependencies.locationRepository = locationRepository;
        this.dependencies.inventoryRepository = inventoryRepository;
        const deliveryRepository = new HttpDeliveryRepository(bookingsClient);
        this.dependencies.deliveryRepository = deliveryRepository;
        this.dependencies.reservationRepository = reservationRepository;

        this.dependencies.loginUseCase = new LoginUseCase(authRepository);
        this.dependencies.logoutUseCase = new LogoutUseCase(authRepository);
        this.dependencies.registerUseCase = new RegisterUseCase(authRepository);
        this.dependencies.getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

        this.dependencies.getLocationsUseCase = new GetLocationsUseCase(locationRepository);
        this.dependencies.getInventoryUseCase = new GetInventoryUseCase(inventoryRepository);
        this.dependencies.createReservationUseCase = new CreateReservationUseCase(reservationRepository);
        this.dependencies.assignInventoryUseCase = new AssignInventoryUseCase(locationRepository);
        this.dependencies.removeInventoryUseCase = new RemoveInventoryUseCase(locationRepository);
        this.dependencies.getUserReservationsUseCase = new GetUserReservationsUseCase(reservationRepository);
        this.dependencies.cancelReservationUseCase = new CancelReservationUseCase(reservationRepository);
        this.dependencies.getSpaceAvailabilityUseCase = new GetSpaceAvailabilityUseCase(reservationRepository);
        this.dependencies.submitDeliveryUseCase = new SubmitDeliveryUseCase(deliveryRepository);
        this.dependencies.deliverReservationUseCase = new DeliverReservationUseCase(reservationRepository);
        this.dependencies.returnReservationUseCase = new ReturnReservationUseCase(reservationRepository);
    }

    get<K extends keyof DependencyMap>(name: K): DependencyMap[K] {
        const dep = this.dependencies[name];
        if (!dep) {
            throw new Error(`Dependency not found: ${name}. Make sure it's registered in DIContainer.`);
        }
        return dep as DependencyMap[K];
    }

    register<K extends keyof DependencyMap>(name: K, instance: DependencyMap[K]): void {
        this.dependencies[name] = instance;
    }

    has(name: keyof DependencyMap): boolean {
        return !!this.dependencies[name];
    }

    reset(): void {
        this.dependencies = {};
        this._registerDependencies();
    }
}

export default new DIContainer();
