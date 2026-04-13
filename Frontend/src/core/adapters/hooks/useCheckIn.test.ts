import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCheckIn } from './useCheckIn';
import { CheckInReservationUseCase } from '../../../application/use-cases/reservations/CheckInReservationUseCase';
import type { Reservation } from '../../domain/entities/Reservation';
import container from '../di/container';

// Mock del use case
vi.mock('../../../application/use-cases/reservations/CheckInReservationUseCase');

// Mock del container
vi.mock('../di/container', () => ({
    default: {
        get: vi.fn()
    }
}));

describe('useCheckIn', () => {
    const mockReservation: Reservation = {
        id: 'res-123',
        userId: 'user-1',
        spaceId: 'space-1',
        locationName: 'Sala 101',
        startAt: new Date('2026-04-07T10:00:00Z'),
        endAt: new Date('2026-04-07T11:00:00Z'),
        status: 'checked_in',
        isCancelled: () => false,
        isCompleted: () => false,
        isPending: () => false,
        isOngoing: () => true,
        isPast: () => false,
        isFuture: () => false,
        canCancel: () => false,
        canUpdate: () => false,
        locationId: 'loc-1',
        equipment: [],
        createdAt: new Date('2026-04-06T10:00:00Z'),
        attendeesCount: 2,
        notes: '',
        checkedInAt: null,
        isActive: () => true,
        isConfirmed: () => true,
        getDurationHours: () => 1,
        getFormattedDateRange: () => '07 abr 2026 10:00 - 11:00',
        getRemainingMinutes: () => 60,
        canCheckIn: () => true,
        isExpired: () => false,
        getCheckInRemainingMinutes: () => 60,
        isAboutToExpire: () => false,
        overlaps: () => false,
        toJSON: () => ({}),
        isCheckedIn: () => true,
        isNoShow: () => false,
        isInProgress: () => false,
        isUpcoming: () => false
    } as Reservation;

    const mockReservationRepository = {
        checkIn: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock container.get to return reservationRepository
        (container.get as ReturnType<typeof vi.fn>).mockReturnValue(mockReservationRepository);
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useCheckIn());

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(typeof result.current.checkIn).toBe('function');
    });

    it('should perform successful check-in with valid reservation and QR token', async () => {
        const mockExecute = vi.fn().mockResolvedValue(mockReservation);
        (CheckInReservationUseCase as unknown as ReturnType<typeof vi.fn>).mockImplementation(function() {
            return {
                execute: mockExecute
            };
        });

        const { result } = renderHook(() => useCheckIn());

        let updatedReservation: Reservation | undefined;

        await act(async () => {
            updatedReservation = await result.current.checkIn('res-123', 'valid-qr-token-jwt');
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(mockExecute).toHaveBeenCalledWith('res-123', 'valid-qr-token-jwt');
        expect(updatedReservation).toEqual(mockReservation);
        expect(result.current.error).toBe(null);
    });

    it('should set loading to true during check-in execution', async () => {
        const mockExecute = vi.fn().mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve(mockReservation), 100))
        );
        (CheckInReservationUseCase as unknown as ReturnType<typeof vi.fn>).mockImplementation(function() {
            return {
                execute: mockExecute
            };
        });

        const { result } = renderHook(() => useCheckIn());

        act(() => {
            result.current.checkIn('res-123', 'valid-qr-token');
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('should handle invalid QR token error', async () => {
        const errorMessage = 'El código QR es inválido o está malformado';
        const mockExecute = vi.fn().mockRejectedValue(new Error(errorMessage));
        (CheckInReservationUseCase as unknown as ReturnType<typeof vi.fn>).mockImplementation(function() {
            return {
                execute: mockExecute
            };
        });

        const { result } = renderHook(() => useCheckIn());
        
        await act(async () => {
            try {
                await result.current.checkIn('res-123', 'invalid-qr');
            } catch (err) {
                expect((err as Error).message).toBe(errorMessage);
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(errorMessage);
            expect(result.current.loading).toBe(false);
        });
    });

    it('should handle QR expired error', async () => {
        const errorMessage = 'El período de check-in ha expirado';
        const mockExecute = vi.fn().mockRejectedValue(new Error(errorMessage));
        (CheckInReservationUseCase as unknown as ReturnType<typeof vi.fn>).mockImplementation(function() {
            return {
                execute: mockExecute
            };
        });

        const { result } = renderHook(() => useCheckIn());

        await act(async () => {
            try {
                await result.current.checkIn('res-123', 'expired-qr-token');
            } catch (err) {
                expect((err as Error).message).toBe(errorMessage);
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(errorMessage);
            expect(result.current.loading).toBe(false);
        });
    });

    it('should handle space mismatch error', async () => {
        const errorMessage = 'El código QR no corresponde a este espacio';
        const mockExecute = vi.fn().mockRejectedValue(new Error(errorMessage));
        (CheckInReservationUseCase as unknown as ReturnType<typeof vi.fn>).mockImplementation(function() {
            return {
                execute: mockExecute
            };
        });

        const { result } = renderHook(() => useCheckIn());

        await act(async () => {
            try {
                await result.current.checkIn('res-123', 'wrong-space-qr');
            } catch (err) {
                expect((err as Error).message).toBe(errorMessage);
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(errorMessage);
        });
    });

    it('should clear previous error on new check-in attempt', async () => {
        const firstError = 'Error inicial';
        const mockExecute = vi.fn()
            .mockRejectedValueOnce(new Error(firstError))
            .mockResolvedValueOnce(mockReservation);

        (CheckInReservationUseCase as unknown as ReturnType<typeof vi.fn>).mockImplementation(function() {
            return {
                execute: mockExecute
            };
        });

        const { result } = renderHook(() => useCheckIn());

        // First attempt - fails
        await act(async () => {
            try {
                await result.current.checkIn('res-123', 'bad-token');
            } catch (err) {
                expect((err as Error).message).toBe(firstError);
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe(firstError);
        });

        // Second attempt - succeeds
        await act(async () => {
            await result.current.checkIn('res-123', 'good-token');
        });

        await waitFor(() => {
            expect(result.current.error).toBe(null);
            expect(result.current.loading).toBe(false);
        });
    });

    it('should handle error without message property', async () => {
        const mockExecute = vi.fn().mockRejectedValue({ code: 'UNKNOWN_ERROR' });
        (CheckInReservationUseCase as unknown as ReturnType<typeof vi.fn>).mockImplementation(function() {
            return {
                execute: mockExecute
            };
        });

        const { result } = renderHook(() => useCheckIn());

        await act(async () => {
            try {
                await result.current.checkIn('res-123', 'token');
            } catch (err) {
                expect(err).toBeDefined();
            }
        });

        await waitFor(() => {
            expect(result.current.error).toBe('Error al realizar el check-in');
            expect(result.current.loading).toBe(false);
        });
    });

    it('should set loading to false even when error occurs', async () => {
        const mockExecute = vi.fn().mockRejectedValue(new Error('Network error'));
        (CheckInReservationUseCase as unknown as ReturnType<typeof vi.fn>).mockImplementation(function() {
            return {
                execute: mockExecute
            };
        });

        const { result } = renderHook(() => useCheckIn());

        await act(async () => {
            try {
                await result.current.checkIn('res-123', 'token');
            } catch (err) {
                expect(err).toBeDefined();
            }
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });
});
