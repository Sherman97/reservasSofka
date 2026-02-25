import { describe, it, expect } from 'vitest';
import { User } from './User';

describe('User - Domain Entity', () => {
    const validUserData = { id: '1', email: 'test@empresa.com', name: 'Juan Pérez', role: 'user' };

    describe('constructor', () => {
        it('should create a user with all properties', () => {
            const user = new User(validUserData);
            expect(user.id).toBe('1');
            expect(user.email).toBe('test@empresa.com');
            expect(user.name).toBe('Juan Pérez');
            expect(user.role).toBe('user');
        });

        it('should default role to "user"', () => {
            const user = new User({ id: '1', email: 'a@b.com', name: 'Test' });
            expect(user.role).toBe('user');
        });
    });

    describe('isAdmin', () => {
        it('should return true for admin role', () => {
            const admin = new User({ ...validUserData, role: 'admin' });
            expect(admin.isAdmin()).toBe(true);
        });

        it('should return false for regular user', () => {
            const user = new User(validUserData);
            expect(user.isAdmin()).toBe(false);
        });
    });

    describe('isRegularUser', () => {
        it('should return true for user role', () => {
            const user = new User(validUserData);
            expect(user.isRegularUser()).toBe(true);
        });

        it('should return false for admin', () => {
            const admin = new User({ ...validUserData, role: 'admin' });
            expect(admin.isRegularUser()).toBe(false);
        });
    });

    describe('getDisplayName', () => {
        it('should return name when present', () => {
            const user = new User(validUserData);
            expect(user.getDisplayName()).toBe('Juan Pérez');
        });

        it('should return email when name is empty', () => {
            const user = new User({ id: '1', email: 'a@b.com', name: '' });
            expect(user.getDisplayName()).toBe('a@b.com');
        });
    });

    describe('isValid', () => {
        it('should return true when all required fields present', () => {
            const user = new User(validUserData);
            expect(user.isValid()).toBe(true);
        });

        it('should return false when id is missing', () => {
            const user = new User({ id: '', email: 'a@b.com', name: 'Test' });
            expect(user.isValid()).toBe(false);
        });

        it('should return false when email is missing', () => {
            const user = new User({ id: '1', email: '', name: 'Test' });
            expect(user.isValid()).toBe(false);
        });

        it('should return false when name is missing', () => {
            const user = new User({ id: '1', email: 'a@b.com', name: '' });
            expect(user.isValid()).toBe(false);
        });
    });

    describe('serialization', () => {
        it('should serialize to JSON', () => {
            const user = new User(validUserData);
            const json = user.toJSON();
            expect(json).toEqual(validUserData);
        });

        it('should deserialize from JSON', () => {
            const user = User.fromJSON(validUserData);
            expect(user).toBeInstanceOf(User);
            expect(user.id).toBe('1');
        });
    });
});
