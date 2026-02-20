import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
    const originalGetItem = Storage.prototype.getItem;

    afterEach(() => {
        Storage.prototype.getItem = originalGetItem;
    });

    const renderWithRoute = (initialRoute = '/dashboard') =>
        render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<div>Dashboard Protected</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

    it('should redirect to login when no token exists', () => {
        Storage.prototype.getItem = vi.fn().mockReturnValue(null);

        renderWithRoute('/dashboard');

        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Dashboard Protected')).not.toBeInTheDocument();
    });

    it('should render children when token exists', () => {
        Storage.prototype.getItem = vi.fn().mockReturnValue('valid-jwt-token');

        renderWithRoute('/dashboard');

        expect(screen.getByText('Dashboard Protected')).toBeInTheDocument();
        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('should check localStorage for "token" key', () => {
        const mockGetItem = vi.fn().mockReturnValue(null);
        Storage.prototype.getItem = mockGetItem;

        renderWithRoute('/dashboard');

        expect(mockGetItem).toHaveBeenCalledWith('token');
    });
});
