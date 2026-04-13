import { describe, it, expect } from 'vitest';
import { LocationMapper } from './LocationMapper';
import { Location } from '../../core/domain/entities/Location';

describe('LocationMapper', () => {
    describe('toDomain()', () => {
        it('debe mapear DTO estándar a dominio', () => {
            const dto = {
                id: 'l1', name: 'Sala A', description: 'Desc', image: 'img.jpg',
                capacity: 10, type: 'sala', cityId: 'c1', tags: ['wifi']
            };
            const location = LocationMapper.toDomain(dto);
            expect(location).toBeInstanceOf(Location);
            expect(location!.id).toBe('l1');
            expect(location!.name).toBe('Sala A');
            expect(location!.imageUrl).toBe('img.jpg');
            expect(location!.amenities).toEqual(['wifi']);
        });

        it('debe usar spaceId si id no existe', () => {
            const dto = { spaceId: 's1', name: 'Sala B' };
            const location = LocationMapper.toDomain(dto);
            expect(location!.id).toBe('s1');
        });

        it('debe usar spaceName si name no existe', () => {
            const dto = { id: 'l1', spaceName: 'Sala C' };
            const location = LocationMapper.toDomain(dto);
            expect(location!.name).toBe('Sala C');
        });

        it('debe usar imageUrl como fallback de image', () => {
            const dto = { id: 'l1', imageUrl: 'url.jpg' };
            const location = LocationMapper.toDomain(dto);
            expect(location!.imageUrl).toBe('url.jpg');
        });

        it('debe usar imageURL como fallback', () => {
            const dto = { id: 'l1', imageURL: 'URL.jpg' };
            const location = LocationMapper.toDomain(dto);
            expect(location!.imageUrl).toBe('URL.jpg');
        });

        it('debe usar maxCapacity como fallback de capacity', () => {
            const dto = { id: 'l1', maxCapacity: 20 };
            const location = LocationMapper.toDomain(dto);
            expect(location!.capacity).toBe(20);
        });

        it('debe usar amenities como fallback de tags', () => {
            const dto = { id: 'l1', amenities: ['tv', 'ac'] };
            const location = LocationMapper.toDomain(dto);
            expect(location!.amenities).toEqual(['tv', 'ac']);
        });

        it('debe retornar null si dto es null', () => {
            expect(LocationMapper.toDomain(null as any)).toBeNull();
        });

        it('debe asignar defaults para campos faltantes', () => {
            const dto = { id: 'l1' };
            const location = LocationMapper.toDomain(dto);
            expect(location!.name).toBe('');
            expect(location!.description).toBe('');
            expect(location!.imageUrl).toBe('');
            expect(location!.capacity).toBe(0);
            expect(location!.type).toBe('sala');
            expect(location!.cityId).toBeNull();
            expect(location!.amenities).toEqual([]);
        });
    });

    describe('toDTO()', () => {
        it('debe mapear dominio a DTO', () => {
            const location = new Location({
                id: 'l1', name: 'Sala A', description: 'Desc', imageUrl: 'img.jpg',
                capacity: 10, type: 'sala', cityId: 'c1', amenities: ['wifi']
            });
            const dto = LocationMapper.toDTO(location);
            expect(dto!.id).toBe('l1');
            expect(dto!.name).toBe('Sala A');
        });

        it('debe retornar null si location es null', () => {
            expect(LocationMapper.toDTO(null as any)).toBeNull();
        });
    });

    describe('toDomainList()', () => {
        it('debe mapear lista de DTOs', () => {
            const dtos = [
                { id: 'l1', name: 'A' },
                { id: 'l2', name: 'B' }
            ];
            const locations = LocationMapper.toDomainList(dtos);
            expect(locations).toHaveLength(2);
            expect(locations[0]).toBeInstanceOf(Location);
        });

        it('debe retornar array vacío si no es array', () => {
            expect(LocationMapper.toDomainList(null as any)).toEqual([]);
        });
    });
});
