import { describe, it, expect, vi } from 'vitest';
import { RegisterUseCase } from './RegisterUseCase';
import { RegistrationError } from '../../../core/domain/errors/AuthenticationError';

describe('RegisterUseCase', () => {
    const createMockRepo = (overrides = {}) => ({
        register: vi.fn().mockResolvedValue({ id: '1', email: 'new@empresa.com', name: 'Nuevo' }),
        ...overrides,
    });

    const validData = { email: 'new@empresa.com', password: 'pass123', name: 'Nuevo Usuario' };

    it('should register successfully with valid data', async () => {
        const mockUser = { id: '1', ...validData };
        const repo = createMockRepo({ register: vi.fn().mockResolvedValue(mockUser) });
        const useCase = new RegisterUseCase(repo);

        const result = await useCase.execute(validData);

        expect(result).toEqual(mockUser);
        expect(repo.register).toHaveBeenCalledWith(validData);
    });

    it('should throw RegistrationError when email is missing', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);

        await expect(useCase.execute({ ...validData, email: '' }))
            .rejects.toThrow('Email, contraseña y nombre son requeridos');
        expect(repo.register).not.toHaveBeenCalled();
    });

    it('should throw RegistrationError when password is missing', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);

        await expect(useCase.execute({ ...validData, password: '' }))
            .rejects.toThrow('Email, contraseña y nombre son requeridos');
    });

    it('should throw RegistrationError when name is missing', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);

        await expect(useCase.execute({ ...validData, name: '' }))
            .rejects.toThrow('Email, contraseña y nombre son requeridos');
    });

    it('should throw RegistrationError for invalid email format', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);

        await expect(useCase.execute({ ...validData, email: 'no-email' }))
            .rejects.toThrow('Email inválido');
    });

    it('should throw RegistrationError for short password', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);

        await expect(useCase.execute({ ...validData, password: '12345' }))
            .rejects.toThrow('La contraseña debe tener al menos 6 caracteres');
    });

    it('should throw RegistrationError for empty name (whitespace only)', async () => {
        const repo = createMockRepo();
        const useCase = new RegisterUseCase(repo);

        await expect(useCase.execute({ ...validData, name: '   ' }))
            .rejects.toThrow('El nombre no puede estar vacío');
    });

    it('should propagate repository errors', async () => {
        const repo = createMockRepo({
            register: vi.fn().mockRejectedValue(new Error('Email already exists')),
        });
        const useCase = new RegisterUseCase(repo);

        await expect(useCase.execute(validData)).rejects.toThrow('Email already exists');
    });
});
