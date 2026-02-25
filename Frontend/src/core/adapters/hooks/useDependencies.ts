/**
 * Re-export dependency hooks from DependencyProvider
 * This file exists as a convenience alias so hooks can be imported from either location.
 * The canonical implementation lives in DependencyProvider.tsx.
 */
export {
    useAuthDependencies,
    useReservationDependencies,
    useDashboardDependencies,
    useDependencies,
} from '../providers/DependencyProvider';

export type {
    AuthDependencies,
    ReservationDependencies,
    DashboardDependencies,
    AllDependencies,
} from '../providers/DependencyProvider';
