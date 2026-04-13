import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ModalScanQr } from './ModalScanQr';
import { useCheckIn } from '../../../core/adapters/hooks/useCheckIn';
import { Html5Qrcode } from 'html5-qrcode';

// Mock dependencias
vi.mock('html5-qrcode', () => ({
    Html5Qrcode: vi.fn(() => ({
        start: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn(),
        isScanning: false
    }))
}));

vi.mock('../../../core/adapters/hooks/useCheckIn', () => ({
    useCheckIn: vi.fn(() => ({
        checkIn: vi.fn(),
        loading: false,
        error: null,
    })),
}));

describe('ModalScanQr', () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();

    const mockReservation = {
        id: 'res-123',
        locationName: 'Sala 101',
        spaceId: 'space-1',
        startAt: new Date('2026-04-07T10:00:00Z'),
        endAt: new Date('2026-04-07T11:00:00Z')
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCheckIn).mockReturnValue({
            checkIn: vi.fn().mockResolvedValue({ id: 'res-123' }),
            loading: false,
            error: null
        });
    });

    it('should not render when isOpen is false', () => {
        const { container } = render(
            <ModalScanQr
                isOpen={false}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should not render when reservation is null', () => {
        const { container } = render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={null}
                onSuccess={mockOnSuccess}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render modal content when open', async () => {
        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        expect(screen.getByText('Escanear Código QR')).toBeInTheDocument();
        expect(screen.getByText(/Sala 101/)).toBeInTheDocument();
        
        await waitFor(() => {
            expect(Html5Qrcode).toHaveBeenCalled();
        });
    });

    it('should call checkIn when QR is scanned successfully', async () => {
        const mockCheckInFn = vi.fn().mockResolvedValue({ id: 'res-123' });
        vi.mocked(useCheckIn).mockReturnValue({
            checkIn: mockCheckInFn,
            loading: false,
            error: null
        });

        let onScanSuccessCallback;
        vi.mocked(Html5Qrcode).mockImplementation(() => ({
            start: vi.fn((facingMode, config, onSuccess) => {
                onScanSuccessCallback = onSuccess;
                return Promise.resolve();
            }),
            stop: vi.fn().mockResolvedValue(undefined),
            clear: vi.fn(),
            isScanning: true
        }));

        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        await waitFor(() => {
            expect(onScanSuccessCallback).toBeDefined();
        });

        await act(async () => {
             await onScanSuccessCallback('token-valid');
        });

        await waitFor(() => {
            expect(mockCheckInFn).toHaveBeenCalledWith('res-123', 'token-valid');
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it('should show error when scanning fails', async () => {
        const mockCheckInFn = vi.fn().mockRejectedValue(new Error('QR inválido'));
        vi.mocked(useCheckIn).mockReturnValue({
            checkIn: mockCheckInFn,
            loading: false,
            error: null
        });

        let onScanSuccessCallback;
        vi.mocked(Html5Qrcode).mockImplementation(() => ({
            start: vi.fn((facingMode, config, onSuccess) => {
                onScanSuccessCallback = onSuccess;
                return Promise.resolve();
            }),
            stop: vi.fn().mockResolvedValue(undefined),
            clear: vi.fn(),
            isScanning: true
        }));

        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        await waitFor(() => {
            expect(onScanSuccessCallback).toBeDefined();
        });

        await act(async () => {
            await onScanSuccessCallback('invalid');
        });

        await waitFor(() => {
            expect(screen.getByText(/QR inválido/)).toBeInTheDocument();
        });
    });

    it('should close modal when cancel is clicked', async () => {
        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        await waitFor(() => {
            expect(Html5Qrcode).toHaveBeenCalled();
        });

        const cancelBtn = screen.getByText('Cancelar');
        await act(async () => {
            cancelBtn.click();
        });

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should clear scanner on unmount', async () => {
        const stopMock = vi.fn().mockResolvedValue(undefined);
        const clearMock = vi.fn();
        vi.mocked(Html5Qrcode).mockImplementation(() => ({
            start: vi.fn().mockResolvedValue(undefined),
            stop: stopMock,
            clear: clearMock,
            isScanning: true
        }));

        const { unmount } = render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        await waitFor(() => {
            expect(Html5Qrcode).toHaveBeenCalled();
        });

        unmount();

        await waitFor(() => {
            expect(stopMock).toHaveBeenCalled();
        });
    });
});
