import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
        return <Navigate to="/dashboard" replace />;
    }

    try {
        const user = JSON.parse(userRaw);
        const role = typeof user?.role === 'string' ? user.role.toLowerCase() : '';
        const roles = Array.isArray(user?.roles)
            ? user.roles
                .filter((item) => typeof item === 'string')
                .map((item) => item.toLowerCase())
            : [];
        const isAdmin = role === 'admin' || roles.includes('admin');

        if (!isAdmin) {
            return <Navigate to="/dashboard" replace />;
        }

        return <Outlet />;
    } catch {
        return <Navigate to="/dashboard" replace />;
    }
};

export default AdminRoute;
