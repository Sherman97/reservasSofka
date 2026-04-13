import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

const mockSetAttribute = vi.fn();
const mockGetItem = vi.fn();
const mockSetItem = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
    mockGetItem.mockReturnValue(null);
    Object.defineProperty(document.documentElement, 'setAttribute', { value: mockSetAttribute, writable: true });
    Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem, setItem: mockSetItem, removeItem: vi.fn(), clear: vi.fn() },
        writable: true
    });
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
    it('debe lanzar error si useTheme se usa fuera del provider', () => {
        expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within a ThemeProvider');
    });

    it('debe usar tema light por defecto', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });
        expect(result.current.theme).toBe('light');
    });

    it('debe recuperar tema de localStorage', () => {
        mockGetItem.mockReturnValue('dark');
        const { result } = renderHook(() => useTheme(), { wrapper });
        expect(result.current.theme).toBe('dark');
    });

    it('debe alternar de light a dark', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => { result.current.toggleTheme(); });

        expect(result.current.theme).toBe('dark');
    });

    it('debe alternar de dark a light', () => {
        mockGetItem.mockReturnValue('dark');
        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => { result.current.toggleTheme(); });

        expect(result.current.theme).toBe('light');
    });

    it('debe guardar tema en localStorage y data-theme', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => { result.current.toggleTheme(); });

        expect(mockSetItem).toHaveBeenCalledWith('theme', 'dark');
        expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });
});
