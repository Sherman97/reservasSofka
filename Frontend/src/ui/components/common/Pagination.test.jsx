import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
    it('should not render when totalPages is 1', () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
        );
        expect(container.innerHTML).toBe('');
    });

    it('should not render when totalPages is 0', () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={0} onPageChange={vi.fn()} />
        );
        expect(container.innerHTML).toBe('');
    });

    it('should render page numbers for multiple pages', () => {
        render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render Anterior and Siguiente buttons', () => {
        render(<Pagination currentPage={2} totalPages={3} onPageChange={vi.fn()} />);
        expect(screen.getByText('Anterior')).toBeInTheDocument();
        expect(screen.getByText('Siguiente')).toBeInTheDocument();
    });

    it('should disable Anterior on first page', () => {
        render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />);
        expect(screen.getByText('Anterior')).toBeDisabled();
    });

    it('should disable Siguiente on last page', () => {
        render(<Pagination currentPage={3} totalPages={3} onPageChange={vi.fn()} />);
        expect(screen.getByText('Siguiente')).toBeDisabled();
    });

    it('should call onPageChange when clicking a page number', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />);

        fireEvent.click(screen.getByText('2'));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange with previous page when clicking Anterior', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />);

        fireEvent.click(screen.getByText('Anterior'));
        expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onPageChange with next page when clicking Siguiente', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />);

        fireEvent.click(screen.getByText('Siguiente'));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should apply active class to current page', () => {
        render(<Pagination currentPage={2} totalPages={3} onPageChange={vi.fn()} />);
        const activeBtn = screen.getByText('2');
        expect(activeBtn.className).toContain('active');
    });
});
