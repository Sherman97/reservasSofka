import { describe, it, expect } from 'vitest';
import { User } from './User';

describe('User Entity', () => {
    const defaultProps = {
        id: 'u1',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'user' as const
    };

    describe('constructor', () => {
        it('debe crear un usuario con todas las propiedades', () => {
            const user = new User(defaultProps);
            expect(user.id).toBe('u1');
            expect(user.email).toBe('john@example.com');
            expect(user.name).toBe('John Doe');
            expect(user.role).toBe('user');
        });

        it('debe asignar role "user" por defecto', () => {
            const user = new User({ id: 'u2', email: 'a@b.com', name: 'A' });
            expect(user.role).toBe('user');
        });
    });

    describe('isAdmin()', () => {
        it('debe retornar true si role es admin', () => {
            const admin = new User({ ...defaultProps, role: 'admin' });
            expect(admin.isAdmin()).toBe(true);
        });

        it('debe retornar false si role es user', () => {
            const user = new User(defaultProps);
            expect(user.isAdmin()).toBe(false);
        });
    });

    describe('isRegularUser()', () => {
        it('debe retornar true si role es user', () => {
            const user = new User(defaultProps);
            expect(user.isRegularUser()).toBe(true);
        });

        it('debe retornar false si role es admin', () => {
            const admin = new User({ ...defaultProps, role: 'admin' });
            expect(admin.isRegularUser()).toBe(false);
        });
    });

    describe('getDisplayName()', () => {
        it('debe retornar el nombre si existe', () => {
            const user = new User(defaultProps);
            expect(user.getDisplayName()).toBe('John Doe');
        });

        it('debe retornar el email si nombre está vacío', () => {
            const user = new User({ ...defaultProps, name: '' });
            expect(user.getDisplayName()).toBe('john@example.com');
        });
    });

    describe('isValid()', () => {
        it('debe retornar true con todas las propiedades', () => {
            const user = new User(defaultProps);
            expect(user.isValid()).toBe(true);
        });

        it('debe retornar false si id está vacío', () => {
            const user = new User({ ...defaultProps, id: '' });
            expect(user.isValid()).toBe(false);
        });

        it('debe retornar false si email está vacío', () => {
            const user = new User({ ...defaultProps, email: '' });
            expect(user.isValid()).toBe(false);
        });

        it('debe retornar false si name está vacío', () => {
            const user = new User({ ...defaultProps, name: '' });
            expect(user.isValid()).toBe(false);
        });
    });

    describe('toJSON()', () => {
        it('debe serializar correctamente', () => {
            const user = new User(defaultProps);
            expect(user.toJSON()).toEqual(defaultProps);
        });
    });

    describe('fromJSON()', () => {
        it('debe deserializar correctamente', () => {
            const user = User.fromJSON(defaultProps);
            expect(user).toBeInstanceOf(User);
            expect(user.id).toBe('u1');
            expect(user.email).toBe('john@example.com');
        });

        it('roundtrip toJSON/fromJSON debe preservar datos', () => {
            const original = new User(defaultProps);
            const restored = User.fromJSON(original.toJSON());
            expect(restored.toJSON()).toEqual(original.toJSON());
        });
    });
});
