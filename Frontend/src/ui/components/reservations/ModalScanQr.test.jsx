import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ModalScanQr } from './ModalScanQr';
import { useCheckIn } from '../../../core/adapters/hooks/useCheckIn';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Mock html5-qrcode
vi.mock('html5-qrcode', () => ({
    Html5QrcodeScanner: vi.fn()
}));

// Mock useCheckIn hook
vi.mock('../../../core/adapters/hooks/useCheckIn');

describe('ModalScanQr', () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();
    const mockCheckIn = vi.fn();
    const mockScannerClear = vi.fn();
    const mockScannerRender = vi.fn();

    const mockReservation = {
        id: 'res-123',
        locationName: 'Sala 101',
        spaceId: 'space-1',
        startAt: new Date('2026-04-07T10:00:00Z'),
        endAt: new Date('2026-04-07T11:00:00Z')
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock useCheckIn hook
        useCheckIn.mockReturnValue({
            checkIn: mockCheckIn,
            loading: false,
            error: null
        });

        // Mock Html5QrcodeScanner with function syntax
        mockScannerClear.mockResolvedValue(undefined);
        Html5QrcodeScanner.mockImplementation(function() {
            return {
                render: mockScannerRender,
                clear: mockScannerClear
            };
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
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

    it('should render modal with correct title when open with reservation', async () => {
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
    });

    it('should initialize QR scanner when modal opens', async () => {
        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        await waitFor(() => {
            expect(Html5QrcodeScanner).toHaveBeenCalledWith(
                'qr-reader',
                expect.objectContaining({
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                }),
                false
            );
        });

        expect(mockScannerRender).toHaveBeenCalled();
    });

    it('should call checkIn when QR is scanned successfully', async () => {
        mockCheckIn.mockResolvedValue({ id: 'res-123', status: 'checked_in' });
        
        let onScanSuccessCallback;
        mockScannerRender.mockImplementation((onSuccess) => {
            onScanSuccessCallback = onSuccess;
        });

        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        await waitFor(() => {
            expect(mockScannerRender).toHaveBeenCalled();
        });

        // Simulate QR scan
        expect(onScanSuccessCallback).toBeDefined();
        await onScanSuccessCallback('valid-qr-token-jwt');

        await waitFor(() => {
            expect(mockCheckIn).toHaveBeenCalledWith('res-123', 'valid-qr-token-jwt');
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it('should display error when check-in fails', async () => {
        const errorMessage = 'El código QR es inválido';
        mockCheckIn.mockRejectedValue(new Error(errorMessage));
        
        let onScanSuccessCallback;
        mockScannerRender.mockImplementation((onSuccess) => {
            onScanSuccessCallback = onSuccess;
        });

        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        await waitFor(() => {
            expect(mockScannerRender).toHaveBeenCalled();
        });

        // Simulate QR scan with error
        await onScanSuccessCallback('invalid-qr-token');

        await waitFor(() => {
            expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument();
        });

        expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should close modal when cancel button is clicked', async () => {
        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        const cancelButton = screen.getByText('Cancelar');
        cancelButton.click();

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when close button (X) is clicked', async () => {
        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        const closeButton = screen.getByText('✕');
        closeButton.click();

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should disable close buttons while processing check-in', async () => {
        mockCheckIn.mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve({ id: 'res-123' }), 100))
        );
        
        let onScanSuccessCallback;
        mockScannerRender.mockImplementation((onSuccess) => {
            onScanSuccessCallback = onSuccess;
        });

        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        await waitFor(() => {
            expect(mockScannerRender).toHaveBeenCalled();
        });

        // Trigger scan
        onScanSuccessCallback('valid-token');

        await waitFor(() => {
            const cancelButton = screen.getByText('Cancelar');
            const closeButton = screen.getByText('✕');
            expect(cancelButton).toBeDisabled();
            expect(closeButton).toBeDisabled();
        });
    });

    it('should clear scanner when modal closes', async () => {
        const { rerender } = render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        await waitFor(() => {
            expect(mockScannerRender).toHaveBeenCalled();
        });

        // Close modal
        rerender(
            <ModalScanQr
                isOpen={false}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        await waitFor(() => {
            expect(mockScannerClear).toHaveBeenCalled();
        });
    });

    it('should show processing state while check-in is in progress', async () => {
        mockCheckIn.mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve({ id: 'res-123' }), 200))
        );
        
        let onScanSuccessCallback;
        mockScannerRender.mockImplementation((onSuccess) => {
            onScanSuccessCallback = onSuccess;
        });

        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        await waitFor(() => {
            expect(mockScannerRender).toHaveBeenCalled();
        });

        // Trigger scan
        onScanSuccessCallback('valid-token');

        await waitFor(() => {
            expect(screen.getByText('Procesando check-in...')).toBeInTheDocument();
        });
    });

    it('should prevent multiple simultaneous scans', async () => {
        mockCheckIn.mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve({ id: 'res-123' }), 100))
        );
        
        let onScanSuccessCallback;
        mockScannerRender.mockImplementation((onSuccess) => {
            onScanSuccessCallback = onSuccess;
        });

        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        await waitFor(() => {
            expect(mockScannerRender).toHaveBeenCalled();
        });

        // Trigger multiple scans
        onScanSuccessCallback('token-1');
        onScanSuccessCallback('token-2');
        onScanSuccessCallback('token-3');

        await waitFor(() => {
            expect(mockCheckIn).toHaveBeenCalledTimes(1);
            expect(mockCheckIn).toHaveBeenCalledWith('res-123', 'token-1');
        });
    });

    it('should display initializing message before scanner is ready', () => {
        mockScannerRender.mockImplementation(() => {
            // Don't call callback immediately
        });

        render(
            <ModalScanQr
                isOpen={true}
                onClose={mockOnClose}
                reservation={mockReservation}
                onSuccess={mockOnSuccess}
            />
        );

        expect(screen.getByText('Iniciando cámara...')).toBeInTheDocument();
    });
});
