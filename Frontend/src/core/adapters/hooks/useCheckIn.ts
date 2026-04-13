import { useState } from 'react';
import { CheckInReservationUseCase } from '../../../application/use-cases/reservations/CheckInReservationUseCase';
import container from '../di/container';
import type { Reservation } from '../../domain/entities/Reservation';

/**
 * Hook para manejar el check-in de reservas mediante escaneo de código QR.
 * 
 * Este hook proporciona la funcionalidad para realizar check-in de una reserva
 * al escanear el código QR del espacio. Maneja el estado de carga y errores.
 * 
 * @returns {Object} - Objeto con función checkIn, estados loading y error
 * 
 * @example
 * const { checkIn, loading, error } = useCheckIn();
 * 
 * const handleQrScanned = async (qrToken: string) => {
 *   try {
 *     const updatedReservation = await checkIn(reservationId, qrToken);
 *     console.log('Check-in exitoso:', updatedReservation);
 *   } catch (err) {
 *     console.error('Error en check-in:', error);
 *   }
 * };
 */
export const useCheckIn = () => {
    const reservationRepository = container.get('reservationRepository');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Realiza el check-in de una reserva usando el token QR escaneado.
     * 
     * @param reservationId - ID de la reserva a hacer check-in
     * @param qrToken - Token JWT extraído del código QR escaneado
     * @returns Promise con la reserva actualizada
     * @throws Error con mensaje descriptivo si el check-in falla
     */
    const checkIn = async (reservationId: string, qrToken: string): Promise<Reservation> => {
        setLoading(true);
        setError(null);
        
        try {
            const useCase = new CheckInReservationUseCase(reservationRepository);
            const updatedReservation = await useCase.execute(reservationId, qrToken);
            return updatedReservation;
        } catch (err: unknown) {
            const errorMessage = (err as Error).message || 'Error al realizar el check-in';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { checkIn, loading, error };
};
