import { describe, it, expect } from 'vitest';
import { DeliveryMapper } from './DeliveryMapper';
import { Delivery } from '../../core/domain/entities/Delivery';

describe('DeliveryMapper', () => {
    describe('toDomain', () => {
        it('debe mapear un DTO del API a entidad Delivery', () => {
            const dto = {
                id: 'd1',
                locationId: 'l1',
                location_id: undefined,
                userId: 'u1',
                user_id: undefined,
                managerId: 'm1',
                manager_id: undefined,
                notes: 'Sin novedades',
                novedad: undefined,
                date: '2026-02-26T15:00:00',
                fecha: undefined,
            };

            const delivery = DeliveryMapper.toDomain(dto);
            expect(delivery).toBeInstanceOf(Delivery);
            expect(delivery?.locationId).toBe('l1');
            expect(delivery?.userId).toBe('u1');
            expect(delivery?.managerId).toBe('m1');
            expect(delivery?.notes).toBe('Sin novedades');
        });

        it('debe manejar campos con snake_case del backend', () => {
            const dto = {
                id: 'd2',
                location_id: 'l2',
                user_id: 'u2',
                manager_id: 'm2',
                novedad: 'Projector roto',
                fecha: '2026-02-26T16:00:00',
            };

            const delivery = DeliveryMapper.toDomain(dto);
            expect(delivery).toBeInstanceOf(Delivery);
            expect(delivery?.locationId).toBe('l2');
            expect(delivery?.userId).toBe('u2');
            expect(delivery?.managerId).toBe('m2');
            expect(delivery?.notes).toBe('Projector roto');
        });

        it('debe retornar null si dto es null', () => {
            const result = DeliveryMapper.toDomain(null as unknown as Record<string, unknown>);
            expect(result).toBeNull();
        });
    });

    describe('toApi', () => {
        it('debe mapear datos del formulario al payload del API', () => {
            const formData = {
                locationId: 'l1',
                userId: 'u1',
                managerId: 'm1',
                notes: 'Novedad de la sala',
                date: '2026-02-26T15:00:00',
            };

            const payload = DeliveryMapper.toApi(formData);
            expect(payload).toHaveProperty('locationId', 'l1');
            expect(payload).toHaveProperty('userId', 'u1');
            expect(payload).toHaveProperty('managerId', 'm1');
            expect(payload).toHaveProperty('notes', 'Novedad de la sala');
            expect(payload).toHaveProperty('date');
        });
    });

    describe('toDomainList', () => {
        it('debe mapear un array de DTOs a entidades Delivery', () => {
            const dtos = [
                { id: 'd1', locationId: 'l1', userId: 'u1', managerId: 'm1', notes: 'N1', date: '2026-02-26T15:00:00' },
                { id: 'd2', locationId: 'l2', userId: 'u2', managerId: 'm2', notes: 'N2', date: '2026-02-27T10:00:00' },
            ];

            const deliveries = DeliveryMapper.toDomainList(dtos);
            expect(deliveries).toHaveLength(2);
            expect(deliveries[0]).toBeInstanceOf(Delivery);
            expect(deliveries[1]).toBeInstanceOf(Delivery);
        });

        it('debe retornar array vacío si input no es array', () => {
            const result = DeliveryMapper.toDomainList(null as unknown as []);
            expect(result).toEqual([]);
        });
    });
});
