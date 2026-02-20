import { createContext } from 'react';

/**
 * DependencyContext - React Context for dependency injection
 * Provides access to the DI container throughout the React component tree
 */
export const DependencyContext = createContext(null);
