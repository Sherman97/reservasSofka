import React from 'react';
import container from '../di/container';
import { DependencyContext } from './DependencyContext';

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
