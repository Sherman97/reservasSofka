/**
 * Integration Tests: Reservation Flow
 * 
 * Tests de integración que verifican la interacción entre capas:
 * UseCase → Repository (fake) → Mapper → Entity
 * 
 * Estos tests validan que la creación, consulta y cancelación
 * de reservas funcionan correctamente a través de las capas.
 */
import { describe, it, expect } from 'vitest';
import { CreateReservationUseCase } from '../../application/use-cases/dashboard/CreateReservationUseCase';
import { GetUserReservationsUseCase } from '../../application/use-cases/reservations/GetUserReservationsUseCase';
import { CancelReservationUseCase } from '../../application/use-cases/reservations/CancelReservationUseCase';
import { GetSpaceAvailabilityUseCase } from '../../application/use-cases/dashboard/GetSpaceAvailabilityUseCase';
import { Reservation } from '../../core/domain/entities/Reservation';
import { ReservationMapper } from '../../infrastructure/mappers/ReservationMapper';
import type { IReservationRepository } from '../../core/ports/repositories/IReservationRepository';

describe('Integration: Reservation Flow (UseCase + Mapper + Entity)', () => {
    /**
     * Fake repository que almacena reservas en memoria
     * y usa ReservationMapper para simular el flujo real
     */
    function createFakeReservationRepo(): IReservationRepository {
        const reservations: Array<Record<string, unknown>> = [];
        let idCounter = 1;

        return {
            async create(data: Record<string, unknown>) {
                const dto = {
                    id: `r${idCounter++}`,
                    userId: 'u1',
                    spaceId: data['locationId'] || data['spaceId'],
                    spaceName: data['locationName'] || 'Sala Test',
                    startAt: '2026-03-01T10:00:00Z',
                    endAt: '2026-03-01T11:00:00Z',
                    equipments: [],
                    status: 'created',
                    createdAt: new Date().toISOString()
                };
                reservations.push(dto);
                return ReservationMapper.toDomain(dto)!;
            },
            async cancel(reservationId: string) {
                const idx = reservations.findIndex(r => r['id'] === reservationId);
                if (idx >= 0) reservations[idx]['status'] = 'cancelled';
            },
            async getById(id: string) {
                const r = reservations.find(r => r['id'] === id);
                return ReservationMapper.toDomain(r as any)!;
            },
            async deliver(id: string, novelty?: string) {
                const idx = reservations.findIndex(r => r['id'] === id);
                if (idx >= 0) reservations[idx]['status'] = 'in_progress';
                return ReservationMapper.toDomain(reservations[idx] as any)!;
            },
            async returnReservation(id: string, novelty?: string) {
                const idx = reservations.findIndex(r => r['id'] === id);
                if (idx >= 0) reservations[idx]['status'] = 'completed';
                return ReservationMapper.toDomain(reservations[idx] as any)!;
            },
            async getByUserId(userId: string) {
                const userReservations = reservations.filter(r => r['userId'] === userId);
                return ReservationMapper.toDomainList(userReservations as any);
            },
            async getAvailability(spaceId: string, date: string) {
                const busy = reservations
                    .filter(r => r['spaceId'] === spaceId && r['status'] !== 'cancelled')
                    .map(r => ({ startAt: r['startAt'] as string, endAt: r['endAt'] as string }));
                return { locationId: spaceId, date, busySlots: busy.map(b => ({ start: b.startAt, end: b.endAt })) };
            }
        };
    }

    it('crear reserva → mapper normaliza status "created" → entity activo', async () => {
        const repo = createFakeReservationRepo();
        const createUseCase = new CreateReservationUseCase(repo);

        const reservation = await createUseCase.execute({
            locationId: 'l1', date: '2026-03-01', startTime: '10:00', endTime: '11:00'
        });

        expect(reservation).toBeInstanceOf(Reservation);
        expect(reservation.status).toBe('active'); // normalizeStatus converts 'created' to 'active'
        expect(reservation.locationId).toBe('l1');
    });

    it('crear → consultar reservas del usuario', async () => {
        const repo = createFakeReservationRepo();
        const createUseCase = new CreateReservationUseCase(repo);
        const getUserReservationsUseCase = new GetUserReservationsUseCase(repo);

        // Crear reservas
        await createUseCase.execute({ locationId: 'l1', date: '2026-03-01', startTime: '10:00', endTime: '11:00' });
        await createUseCase.execute({ locationId: 'l2', date: '2026-03-02', startTime: '14:00', endTime: '15:00' });

        // Consultar
        const reservations = await getUserReservationsUseCase.execute('u1');
        expect(reservations).toHaveLength(2);
        expect(reservations[0]).toBeInstanceOf(Reservation);
    });

    it('crear → cancelar → verificar estado', async () => {
        const repo = createFakeReservationRepo();
        const createUseCase = new CreateReservationUseCase(repo);
        const cancelUseCase = new CancelReservationUseCase(repo);
        const getUserReservationsUseCase = new GetUserReservationsUseCase(repo);

        // Crear
        const reservation = await createUseCase.execute({
            locationId: 'l1', date: '2026-03-01', startTime: '10:00', endTime: '11:00'
        });

        // Cancelar
        await cancelUseCase.execute(reservation.id);

        // Verificar - la reserva cancelada debería tener status 'cancelled'
        const all = await getUserReservationsUseCase.execute('u1');
        expect(all[0].status).toBe('cancelled');
    });

    it('crear → verificar disponibilidad del espacio', async () => {
        const repo = createFakeReservationRepo();
        const createUseCase = new CreateReservationUseCase(repo);
        const availabilityUseCase = new GetSpaceAvailabilityUseCase(repo);

        // Sin reservas → sin busy slots
        const before = await availabilityUseCase.execute('l1', '2026-03-01');
        expect(before.busySlots).toHaveLength(0);

        // Crear reserva
        await createUseCase.execute({ locationId: 'l1', date: '2026-03-01', startTime: '10:00', endTime: '11:00' });

        // Con reserva → un busy slot
        const after = await availabilityUseCase.execute('l1', '2026-03-01');
        expect(after.busySlots).toHaveLength(1);
    });
});
