import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderHook } from '@testing-library/react';
import { DependencyProvider, useAuthDependencies, useReservationDependencies, useDashboardDependencies, useDeliveryDependencies } from './DependencyProvider';

// Mock the container to avoid importing all real dependencies
vi.mock('../di/container', () => {
    const deps: Record<string, unknown> = {
        loginUseCase: { execute: vi.fn() },
        logoutUseCase: { execute: vi.fn() },
        registerUseCase: { execute: vi.fn() },
        getCurrentUserUseCase: { execute: vi.fn() },
        getLocationsUseCase: { execute: vi.fn() },
        getInventoryUseCase: { execute: vi.fn() },
        createReservationUseCase: { execute: vi.fn() },
        getUserReservationsUseCase: { execute: vi.fn() },
        cancelReservationUseCase: { execute: vi.fn() },
        getSpaceAvailabilityUseCase: { execute: vi.fn() },
        assignInventoryUseCase: { execute: vi.fn() },
        removeInventoryUseCase: { execute: vi.fn() },
        submitDeliveryUseCase: { execute: vi.fn() },
        deliverReservationUseCase: { execute: vi.fn() },
        returnReservationUseCase: { execute: vi.fn() },
        webSocketService: { connect: vi.fn(), subscribe: vi.fn() }
    };
    return {
        default: {
            get: (name: string) => {
                if (!deps[name]) throw new Error(`Dependency not found: ${name}`);
                return deps[name];
            }
        }
    };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DependencyProvider>{children}</DependencyProvider>
);

describe('DependencyProvider', () => {
    it('debe lanzar error si useAuthDependencies se usa fuera del provider', () => {
        expect(() => renderHook(() => useAuthDependencies())).toThrow(
            'Dependency hooks must be used within DependencyProvider'
        );
    });

    it('debe proveer auth dependencies', () => {
        const { result } = renderHook(() => useAuthDependencies(), { wrapper });
        expect(result.current.loginUseCase).toBeDefined();
        expect(result.current.logoutUseCase).toBeDefined();
        expect(result.current.registerUseCase).toBeDefined();
        expect(result.current.getCurrentUserUseCase).toBeDefined();
    });

    it('debe proveer reservation dependencies', () => {
        const { result } = renderHook(() => useReservationDependencies(), { wrapper });
        expect(result.current.getLocationsUseCase).toBeDefined();
        expect(result.current.getInventoryUseCase).toBeDefined();
        expect(result.current.createReservationUseCase).toBeDefined();
        expect(result.current.getUserReservationsUseCase).toBeDefined();
        expect(result.current.cancelReservationUseCase).toBeDefined();
        expect(result.current.getSpaceAvailabilityUseCase).toBeDefined();
        expect(result.current.deliverReservationUseCase).toBeDefined();
        expect(result.current.returnReservationUseCase).toBeDefined();
        expect(result.current.webSocketService).toBeDefined();
    });

    it('debe proveer dashboard dependencies', () => {
        const { result } = renderHook(() => useDashboardDependencies(), { wrapper });
        expect(result.current.getLocationsUseCase).toBeDefined();
        expect(result.current.getInventoryUseCase).toBeDefined();
        expect(result.current.assignInventoryUseCase).toBeDefined();
        expect(result.current.removeInventoryUseCase).toBeDefined();
    });

    it('debe proveer delivery dependencies', () => {
        const { result } = renderHook(() => useDeliveryDependencies(), { wrapper });
        expect(result.current.submitDeliveryUseCase).toBeDefined();
    });
});
