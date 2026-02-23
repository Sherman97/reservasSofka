import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute component
 * Checks if the user is authenticated by looking for a token in localStorage.
 * If not authenticated, redirects to the login page.
 */
const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Redirect to login if there is no token
        return <Navigate to="/login" replace />;
    }

    // Render children or nested routes
    return <Outlet />;
};

export default ProtectedRoute;
