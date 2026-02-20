import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
    it('should render search input with placeholder', () => {
        render(<SearchBar searchQuery="" handleSearch={vi.fn()} />);
        expect(screen.getByPlaceholderText(/buscar salas o equipos/i)).toBeInTheDocument();
    });

    it('should display current search query', () => {
        render(<SearchBar searchQuery="sala" handleSearch={vi.fn()} />);
        expect(screen.getByDisplayValue('sala')).toBeInTheDocument();
    });

    it('should call handleSearch on input change', () => {
        const handleSearch = vi.fn();
        render(<SearchBar searchQuery="" handleSearch={handleSearch} />);

        fireEvent.change(screen.getByPlaceholderText(/buscar salas o equipos/i), {
            target: { value: 'proyector' },
        });

        expect(handleSearch).toHaveBeenCalled();
    });

    it('should render search icon', () => {
        render(<SearchBar searchQuery="" handleSearch={vi.fn()} />);
        expect(screen.getByText('🔍')).toBeInTheDocument();
    });
});
