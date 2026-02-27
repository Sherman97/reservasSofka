import { describe, it, expect } from 'vitest';
import { ReservationMapper } from './ReservationMapper';
import { Reservation } from '../../core/domain/entities/Reservation';

describe('ReservationMapper', () => {
    describe('toDomain()', () => {
        it('debe mapear DTO estándar a dominio', () => {
            const dto = {
                id: 'r1', userId: 'u1', spaceId: 'l1', spaceName: 'Sala A',
                startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z',
                equipments: ['e1'], status: 'active', createdAt: '2026-02-28T12:00:00Z'
            };
            const reservation = ReservationMapper.toDomain(dto);
            expect(reservation).toBeInstanceOf(Reservation);
            expect(reservation!.id).toBe('r1');
            expect(reservation!.locationId).toBe('l1');
            expect(reservation!.locationName).toBe('Sala A');
            expect(reservation!.equipment).toEqual(['e1']);
        });

        it('debe usar bookingId si id no existe', () => {
            const dto = { bookingId: 'b1', startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' };
            const reservation = ReservationMapper.toDomain(dto);
            expect(reservation!.id).toBe('b1');
        });

        it('debe usar user_id si userId no existe', () => {
            const dto = { id: 'r1', user_id: 'u2', startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' };
            const reservation = ReservationMapper.toDomain(dto);
            expect(reservation!.userId).toBe('u2');
        });

        it('debe usar locationId si spaceId no existe', () => {
            const dto = { id: 'r1', locationId: 'loc1', startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' };
            const reservation = ReservationMapper.toDomain(dto);
            expect(reservation!.locationId).toBe('loc1');
        });

        it('debe usar space_id como fallback', () => {
            const dto = { id: 'r1', space_id: 'sp1', startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' };
            const reservation = ReservationMapper.toDomain(dto);
            expect(reservation!.locationId).toBe('sp1');
        });

        it('debe usar locationName si spaceName no existe', () => {
            const dto = { id: 'r1', locationName: 'Oficina', startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' };
            const reservation = ReservationMapper.toDomain(dto);
            expect(reservation!.locationName).toBe('Oficina');
        });

        it('debe usar space_name como fallback', () => {
            const dto = { id: 'r1', space_name: 'Sala Z', startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' };
            const reservation = ReservationMapper.toDomain(dto);
            expect(reservation!.locationName).toBe('Sala Z');
        });

        it('debe usar title como último fallback de locationName', () => {
            const dto = { id: 'r1', title: 'Mi Reserva', startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' };
            const reservation = ReservationMapper.toDomain(dto);
            expect(reservation!.locationName).toBe('Mi Reserva');
        });

        it('debe usar start_at si startAt no existe', () => {
            const dto = { id: 'r1', start_at: '2026-03-01T10:00:00Z', end_at: '2026-03-01T11:00:00Z' };
            const reservation = ReservationMapper.toDomain(dto);
            expect(reservation!.startAt).toBeInstanceOf(Date);
        });

        it('debe usar items como fallback de equipments', () => {
            const dto = { id: 'r1', items: ['i1', 'i2'], startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' };
            const reservation = ReservationMapper.toDomain(dto);
            expect(reservation!.equipment).toEqual(['i1', 'i2']);
        });

        it('debe usar equipment como fallback', () => {
            const dto = { id: 'r1', equipment: ['eq1'], startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' };
            const reservation = ReservationMapper.toDomain(dto);
            expect(reservation!.equipment).toEqual(['eq1']);
        });

        it('debe usar created_at si createdAt no existe', () => {
            const dto = { id: 'r1', created_at: '2026-02-28T12:00:00Z', startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' };
            const reservation = ReservationMapper.toDomain(dto);
            expect(reservation!.createdAt).toBeInstanceOf(Date);
        });

        it('debe retornar null si dto es null', () => {
            expect(ReservationMapper.toDomain(null as any)).toBeNull();
        });
    });

    describe('normalizeStatus()', () => {
        it('debe retornar active para undefined', () => {
            expect(ReservationMapper.normalizeStatus(undefined)).toBe('active');
        });

        it('debe retornar active para pending', () => {
            expect(ReservationMapper.normalizeStatus('pending')).toBe('active');
        });

        it('debe retornar active para confirmed', () => {
            expect(ReservationMapper.normalizeStatus('confirmed')).toBe('active');
        });

        it('debe retornar active para in_progress', () => {
            expect(ReservationMapper.normalizeStatus('in_progress')).toBe('active');
        });

        it('debe retornar active para active', () => {
            expect(ReservationMapper.normalizeStatus('active')).toBe('active');
        });

        it('debe retornar active para created', () => {
            expect(ReservationMapper.normalizeStatus('created')).toBe('active');
        });

        it('debe retornar active para PENDING (case insensitive)', () => {
            expect(ReservationMapper.normalizeStatus('PENDING')).toBe('active');
        });

        it('debe retornar cancelled para cancelled', () => {
            expect(ReservationMapper.normalizeStatus('cancelled')).toBe('cancelled');
        });

        it('debe retornar completed para completed', () => {
            expect(ReservationMapper.normalizeStatus('completed')).toBe('completed');
        });
    });

    describe('toDTO()', () => {
        it('debe mapear dominio a DTO', () => {
            const reservation = new Reservation({
                id: 'r1', userId: 'u1', locationId: 'l1', locationName: 'Sala A',
                startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z',
                equipment: ['e1'], status: 'active', createdAt: '2026-02-28T12:00:00Z'
            });
            const dto = ReservationMapper.toDTO(reservation);
            expect(dto!.id).toBe('r1');
            expect(dto!.userId).toBe('u1');
        });

        it('debe retornar null si reservation es null', () => {
            expect(ReservationMapper.toDTO(null as any)).toBeNull();
        });
    });

    describe('toApi()', () => {
        it('debe convertir datos de creación al formato API', () => {
            const data = {
                locationId: 'l1', locationName: 'Sala A',
                date: '2026-03-01', startTime: '10:00', endTime: '11:00',
                title: 'Mi Reunión', attendeesCount: 5, notes: 'Nota',
                equipment: [{ itemId: 'e1' }, { id: 'e2' }, 'e3']
            };
            const payload = ReservationMapper.toApi(data);
            expect(payload.spaceId).toBe('l1');
            expect(payload.title).toBe('Mi Reunión');
            expect(payload.attendeesCount).toBe(5);
            expect(payload.notes).toBe('Nota');
            expect(payload.equipmentIds).toEqual(['e1', 'e2', 'e3']);
            expect(payload.startAt).toBeDefined();
            expect(payload.endAt).toBeDefined();
        });

        it('debe usar título por defecto si no se provee', () => {
            const data = {
                locationId: 'l1', locationName: 'Sala X',
                date: '2026-03-01', startTime: '10:00', endTime: '11:00'
            };
            const payload = ReservationMapper.toApi(data);
            expect(payload.title).toBe('Reserva de Sala X');
        });

        it('debe usar defaults para campos opcionales', () => {
            const data = {
                locationId: 'l1', date: '2026-03-01', startTime: '10:00', endTime: '11:00'
            };
            const payload = ReservationMapper.toApi(data);
            expect(payload.attendeesCount).toBe(1);
            expect(payload.notes).toBe('');
            expect(payload.equipmentIds).toEqual([]);
            expect(payload.title).toBe('Reserva de espacio');
        });
    });

    describe('toDomainList()', () => {
        it('debe mapear lista de DTOs', () => {
            const dtos = [
                { id: 'r1', startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z' },
                { id: 'r2', startAt: '2026-03-01T12:00:00Z', endAt: '2026-03-01T13:00:00Z' }
            ];
            const reservations = ReservationMapper.toDomainList(dtos);
            expect(reservations).toHaveLength(2);
            expect(reservations[0]).toBeInstanceOf(Reservation);
        });

        it('debe retornar array vacío si no es array', () => {
            expect(ReservationMapper.toDomainList(null as any)).toEqual([]);
        });
    });
});
