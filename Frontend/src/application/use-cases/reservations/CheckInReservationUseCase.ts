import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';
import type { Reservation } from '../../../core/domain/entities/Reservation';

/**
 * Use case para realizar check-in de una reserva usando código QR.
 * 
 * Este caso de uso orquesta el proceso de check-in:
 * 1. Valida los parámetros de entrada (reservationId y qrToken)
 * 2. Delega la llamada al repositorio que interactúa con el backend
 * 3. Retorna la reserva actualizada con estado CHECKED_IN
 * 
 * Las validaciones de negocio (período de gracia, estado de la reserva, etc.)
 * se realizan en el backend. Los errores específicos de dominio
 * (InvalidQrCodeError, QrExpiredError, etc.) son lanzados por el repositorio
 * al mapear las respuestas HTTP del backend.
 */
export class CheckInReservationUseCase {
    constructor(private readonly reservationRepository: IReservationRepository) {}

    /**
     * Ejecuta el check-in de una reserva.
     * 
     * @param reservationId - ID de la reserva a hacer check-in
     * @param qrToken - Token JWT del código QR escaneado
     * @returns Promise con la reserva actualizada
     * @throws {InvalidQrCodeError} Si el QR es inválido o está malformado
     * @throws {QrExpiredError} Si el período de check-in ha expirado
     * @throws {QrSpaceMismatchError} Si el QR no corresponde al espacio de la reserva
     * @throws {InvalidReservationStateError} Si la reserva no está en estado válido
     * @throws {Error} Para errores de red u otros errores no mapeados
     */
    async execute(reservationId: string, qrToken: string): Promise<Reservation> {
        const rId = String(reservationId || '').trim();
        const token = String(qrToken || '').trim();

        if (!rId) {
            throw new Error('Reservation ID is required');
        }

        if (!token) {
            throw new Error('QR token is required');
        }

        return await this.reservationRepository.checkIn(rId, token);
    }
}
