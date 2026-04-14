import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import AdminRoute from './AdminRoute';

const renderWithRoutes = (initialPath = '/admin') => render(
  <MemoryRouter initialEntries={[initialPath]}>
    <Routes>
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<div>Admin Page</div>} />
      </Route>
    </Routes>
  </MemoryRouter>,
);

describe('AdminRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirige a login cuando no hay token', () => {
    renderWithRoutes('/admin');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirige a dashboard cuando hay token pero no hay usuario', () => {
    localStorage.setItem('token', 'abc');
    renderWithRoutes('/admin');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('redirige a dashboard cuando usuario no es admin', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify({ role: 'user' }));
    renderWithRoutes('/admin');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('permite acceso cuando role principal es admin', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
    renderWithRoutes('/admin');
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  it('permite acceso cuando roles incluye admin y tolera valores no string', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify({ roles: [null, 'ADMIN'] }));
    renderWithRoutes('/admin');
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  it('redirige a dashboard cuando JSON de usuario es invalido', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', '{invalid-json');
    renderWithRoutes('/admin');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});
