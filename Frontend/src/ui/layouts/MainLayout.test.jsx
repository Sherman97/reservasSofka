import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MainLayout } from './MainLayout';

vi.mock('../components/common/Header', () => ({
    Header: () => <header data-testid="header">Header</header>
}));
vi.mock('../styles/layouts/Layout.css', () => ({}));

describe('MainLayout', () => {
    it('debe renderizar Header y contenido', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<div>Child Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('header')).toBeDefined();
        expect(screen.getByText('Child Content')).toBeDefined();
    });

    it('debe tener clase main-layout', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<div>Test</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(container.querySelector('.main-layout')).not.toBeNull();
    });
});
