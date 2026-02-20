import { describe, it, expect } from 'vitest';
import { ReservationMapper } from './ReservationMapper';

describe('ReservationMapper', () => {
    describe('toApi', () => {
        it('should correctly format data and dates for the API', () => {
            const uiData = {
                locationId: 10,
                locationName: 'Sala de Juntas',
                date: '2026-05-20',
                startTime: '09:30',
                endTime: '11:00',
                equipment: [1, 2],
                notes: 'Test note'
            };

            const payload = ReservationMapper.toApi(uiData);

            expect(payload.spaceId).toBe(10);
            expect(payload.title).toBe('Reserva de Sala de Juntas');
            expect(payload.equipmentIds).toEqual([1, 2]);
            expect(payload.notes).toBe('Test note');

            // Validate ISO date conversion (local time to ISO)
            // 2026-05-20 09:30 local -> ISO
            const expectedStart = new Date(2026, 4, 20, 9, 30).toISOString();
            const expectedEnd = new Date(2026, 4, 20, 11, 0).toISOString();

            expect(payload.startAt).toBe(expectedStart);
            expect(payload.endAt).toBe(expectedEnd);
        });

        it('should handle equipment objects by extracting ID', () => {
            const uiData = {
                date: '2026-05-20',
                startTime: '09:00',
                endTime: '10:00',
                equipment: [{ itemId: 101, name: 'Projector' }, { id: 102 }]
            };

            const payload = ReservationMapper.toApi(uiData);

            expect(payload.equipmentIds).toEqual([101, 102]);
        });

        it('should provide default values for optional fields', () => {
            const uiData = {
                locationId: 5,
                date: '2026-01-01',
                startTime: '10:00',
                endTime: '11:00'
            };

            const payload = ReservationMapper.toApi(uiData);

            expect(payload.title).toBe('Reserva de espacio');
            expect(payload.attendeesCount).toBe(1);
            expect(payload.notes).toBe('');
        });
    });
});
