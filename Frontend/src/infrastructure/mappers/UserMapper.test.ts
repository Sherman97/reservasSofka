import { describe, it, expect } from 'vitest';
import { UserMapper } from './UserMapper';
import { User } from '../../core/domain/entities/User';

describe('UserMapper', () => {
    describe('toDomain()', () => {
        it('debe mapear DTO a dominio correctamente', () => {
            const dto = { id: 'u1', email: 'test@mail.com', name: 'Test User', role: 'admin' };
            const user = UserMapper.toDomain(dto);
            expect(user).toBeInstanceOf(User);
            expect(user!.id).toBe('u1');
            expect(user!.email).toBe('test@mail.com');
            expect(user!.name).toBe('Test User');
            expect(user!.role).toBe('admin');
        });

        it('debe usar username si name no existe', () => {
            const dto = { id: 'u1', email: 'test@mail.com', username: 'testuser' };
            const user = UserMapper.toDomain(dto);
            expect(user!.name).toBe('testuser');
        });

        it('debe usar fullName si name y username no existen', () => {
            const dto = { id: 'u1', email: 'test@mail.com', fullName: 'Full Name' };
            const user = UserMapper.toDomain(dto);
            expect(user!.name).toBe('Full Name');
        });

        it('debe asignar nombre vacío si no hay alias', () => {
            const dto = { id: 'u1', email: 'test@mail.com' };
            const user = UserMapper.toDomain(dto);
            expect(user!.name).toBe('');
        });

        it('debe asignar role "user" por defecto', () => {
            const dto = { id: 'u1', email: 'test@mail.com', name: 'Test' };
            const user = UserMapper.toDomain(dto);
            expect(user!.role).toBe('user');
        });

        it('debe retornar null si dto es null', () => {
            const result = UserMapper.toDomain(null as any);
            expect(result).toBeNull();
        });
    });

    describe('toDTO()', () => {
        it('debe mapear dominio a DTO', () => {
            const user = new User({ id: 'u1', email: 'a@b.com', name: 'Test', role: 'user' });
            const dto = UserMapper.toDTO(user);
            expect(dto).toEqual({ id: 'u1', email: 'a@b.com', name: 'Test', role: 'user' });
        });

        it('debe retornar null si user es null', () => {
            const result = UserMapper.toDTO(null as any);
            expect(result).toBeNull();
        });
    });

    describe('toDomainList()', () => {
        it('debe mapear lista de DTOs', () => {
            const dtos = [
                { id: 'u1', email: 'a@b.com', name: 'A' },
                { id: 'u2', email: 'c@d.com', name: 'B' }
            ];
            const users = UserMapper.toDomainList(dtos);
            expect(users).toHaveLength(2);
            expect(users[0]).toBeInstanceOf(User);
        });

        it('debe retornar array vacío si input no es array', () => {
            const result = UserMapper.toDomainList(null as any);
            expect(result).toEqual([]);
        });
    });

    describe('toDTOList()', () => {
        it('debe mapear lista de Users', () => {
            const users = [
                new User({ id: 'u1', email: 'a@b.com', name: 'A', role: 'user' }),
                new User({ id: 'u2', email: 'c@d.com', name: 'B', role: 'admin' })
            ];
            const dtos = UserMapper.toDTOList(users);
            expect(dtos).toHaveLength(2);
            expect(dtos[0].id).toBe('u1');
        });

        it('debe retornar array vacío si input no es array', () => {
            const result = UserMapper.toDTOList(null as any);
            expect(result).toEqual([]);
        });
    });
});
