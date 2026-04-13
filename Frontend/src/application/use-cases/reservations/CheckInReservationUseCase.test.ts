import { describe, it, expect, vi } from 'vitest';
import { CheckInReservationUseCase } from './CheckInReservationUseCase';
import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';
import { Reservation } from '../../../core/domain/entities/Reservation';
import {
    InvalidQrCodeError,
    QrExpiredError,
    QrSpaceMismatchError,
    InvalidReservationStateError
} from '../../../core/domain/errors/QrScanError';

describe('CheckInReservationUseCase', () => {
    const createMockRepo = (overrides: Partial<IReservationRepository> = {}): IReservationRepository => ({
        create: vi.fn(),
        cancel: vi.fn(),
        getByUserId: vi.fn(),
        getById: vi.fn(),
        deliver: vi.fn(),
        returnReservation: vi.fn(),
        getAvailability: vi.fn(),
        update: vi.fn(),
        checkIn: vi.fn().mockResolvedValue(
            new Reservation({
                id: 'r1',
                userId: 'u1',
                locationId: 'l1',
                locationName: 'Sala A',
                startAt: new Date('2026-03-01T10:00:00Z').toISOString(),
                endAt: new Date('2026-03-01T11:00:00Z').toISOString(),
                status: 'CHECKED_IN',
                checkedInAt: new Date('2026-03-01T09:58:00Z').toISOString()
            })
        ),
        ...overrides
    });

    it('debe realizar check-in exitoso con ID y token válidos', async () => {
        const repo = createMockRepo();
        const useCase = new CheckInReservationUseCase(repo);
        
        const result = await useCase.execute('r1', 'valid-qr-token');
        
        expect(repo.checkIn).toHaveBeenCalledWith('r1', 'valid-qr-token');
        expect(result).toBeInstanceOf(Reservation);
        expect(result.id).toBe('r1');
        expect(result.status).toBe('CHECKED_IN');
    });

    it('debe lanzar error si reservationId está vacío', async () => {
        const repo = createMockRepo();
        const useCase = new CheckInReservationUseCase(repo);
        
        await expect(useCase.execute('', 'valid-qr-token'))
            .rejects.toThrow('Reservation ID is required');
        
        expect(repo.checkIn).not.toHaveBeenCalled();
    });

    it('debe lanzar error si reservationId es solo espacios', async () => {
        const repo = createMockRepo();
        const useCase = new CheckInReservationUseCase(repo);
        
        await expect(useCase.execute('   ', 'valid-qr-token'))
            .rejects.toThrow('Reservation ID is required');
        
        expect(repo.checkIn).not.toHaveBeenCalled();
    });

    it('debe lanzar error si qrToken está vacío', async () => {
        const repo = createMockRepo();
        const useCase = new CheckInReservationUseCase(repo);
        
        await expect(useCase.execute('r1', ''))
            .rejects.toThrow('QR token is required');
        
        expect(repo.checkIn).not.toHaveBeenCalled();
    });

    it('debe lanzar error si qrToken es solo espacios', async () => {
        const repo = createMockRepo();
        const useCase = new CheckInReservationUseCase(repo);
        
        await expect(useCase.execute('r1', '   '))
            .rejects.toThrow('QR token is required');
        
        expect(repo.checkIn).not.toHaveBeenCalled();
    });

    it('debe propagar InvalidQrCodeError desde el repositorio', async () => {
        const repo = createMockRepo({
            checkIn: vi.fn().mockRejectedValue(
                new InvalidQrCodeError('El código QR es inválido')
            )
        });
        const useCase = new CheckInReservationUseCase(repo);
        
        await expect(useCase.execute('r1', 'invalid-qr'))
            .rejects.toThrow(InvalidQrCodeError);
        await expect(useCase.execute('r1', 'invalid-qr'))
            .rejects.toThrow('El código QR es inválido');
        
        expect(repo.checkIn).toHaveBeenCalledWith('r1', 'invalid-qr');
    });

    it('debe propagar QrExpiredError desde el repositorio', async () => {
        const repo = createMockRepo({
            checkIn: vi.fn().mockRejectedValue(
                new QrExpiredError('El período de check-in ha expirado')
            )
        });
        const useCase = new CheckInReservationUseCase(repo);
        
        await expect(useCase.execute('r1', 'expired-qr'))
            .rejects.toThrow(QrExpiredError);
        await expect(useCase.execute('r1', 'expired-qr'))
            .rejects.toThrow('El período de check-in ha expirado');
    });

    it('debe propagar QrSpaceMismatchError desde el repositorio', async () => {
        const repo = createMockRepo({
            checkIn: vi.fn().mockRejectedValue(
                new QrSpaceMismatchError('El código QR no corresponde a este espacio')
            )
        });
        const useCase = new CheckInReservationUseCase(repo);
        
        await expect(useCase.execute('r1', 'qr-other-space'))
            .rejects.toThrow(QrSpaceMismatchError);
        await expect(useCase.execute('r1', 'qr-other-space'))
            .rejects.toThrow('El código QR no corresponde a este espacio');
    });

    it('debe propagar InvalidReservationStateError desde el repositorio', async () => {
        const repo = createMockRepo({
            checkIn: vi.fn().mockRejectedValue(
                new InvalidReservationStateError('La reserva no está en estado válido')
            )
        });
        const useCase = new CheckInReservationUseCase(repo);
        
        await expect(useCase.execute('r1', 'valid-qr'))
            .rejects.toThrow(InvalidReservationStateError);
        await expect(useCase.execute('r1', 'valid-qr'))
            .rejects.toThrow('La reserva no está en estado válido');
    });

    it('debe propagar errores genéricos desde el repositorio', async () => {
        const repo = createMockRepo({
            checkIn: vi.fn().mockRejectedValue(new Error('Network error'))
        });
        const useCase = new CheckInReservationUseCase(repo);
        
        await expect(useCase.execute('r1', 'valid-qr'))
            .rejects.toThrow('Network error');
    });

    it('debe validar ambos parámetros antes de llamar al repositorio', async () => {
        const repo = createMockRepo();
        const useCase = new CheckInReservationUseCase(repo);
        
        // Primer parámetro inválido
        await expect(useCase.execute('', 'valid-qr'))
            .rejects.toThrow('Reservation ID is required');
        
        // Segundo parámetro inválido
        await expect(useCase.execute('r1', ''))
            .rejects.toThrow('QR token is required');
        
        // Ninguna de las llamadas debe haber llegado al repositorio
        expect(repo.checkIn).not.toHaveBeenCalled();
    });

    it('debe trimear los strings antes de validar y pasar al repositorio', async () => {
        const repo = createMockRepo();
        const useCase = new CheckInReservationUseCase(repo);
        
        // Llamada exitosa con espacios al inicio/final
        await useCase.execute('  r1  ', '  valid-qr-token  ');
        
        // Debe haber llamado al repositorio con los valores trimeados
        expect(repo.checkIn).toHaveBeenCalledWith('r1', 'valid-qr-token');
    });

    it('debe manejar IDs numéricos convirtiéndolos a string de forma segura', async () => {
        const repo = createMockRepo();
        const useCase = new CheckInReservationUseCase(repo);
        
        // Simular un ID que viene como número (por ejemplo, desde el backend)
        await useCase.execute(123 as any, 'valid-token');
        
        expect(repo.checkIn).toHaveBeenCalledWith('123', 'valid-token');
    });
});
