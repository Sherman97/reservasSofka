import { User } from '../../core/domain/entities/User';
import type { UserProps } from '../../core/domain/entities/User';

interface UserDTO {
    id: string;
    email: string;
    name?: string;
    username?: string;
    fullName?: string;
    role?: string;
    roles?: string[];
}

export class UserMapper {
    static toDomain(dto: UserDTO): User | null {
        if (!dto) return null;
        const normalizedRoles = this.normalizeRoles(dto.roles);
        const role = this.resolvePrimaryRole(dto.role, normalizedRoles);
        return new User({
            id: dto.id,
            email: dto.email,
            name: dto.name || dto.username || dto.fullName || '',
            role,
            roles: normalizedRoles.length > 0 ? normalizedRoles : [role]
        });
    }

    static toDTO(user: User): UserProps | null {
        if (!user) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role, roles: user.roles };
    }

    static toDomainList(dtos: UserDTO[]): User[] {
        if (!Array.isArray(dtos)) return [];
        return dtos.map(dto => this.toDomain(dto)).filter((u): u is User => u !== null);
    }

    static toDTOList(users: User[]): UserProps[] {
        if (!Array.isArray(users)) return [];
        return users.map(user => this.toDTO(user)).filter((u): u is UserProps => u !== null);
    }

    private static normalizeRoles(roles?: string[]): string[] {
        if (!Array.isArray(roles)) return [];
        return Array.from(
            new Set(
                roles
                    .filter((role) => typeof role === 'string' && role.trim().length > 0)
                    .map((role) => role.trim().toLowerCase())
                    .map((role) => {
                        if (role === 'admin') return 'admin';
                        if (role === 'user') return 'user';
                        return role;
                    })
            )
        );
    }

    private static resolvePrimaryRole(role?: string, normalizedRoles: string[] = []): string {
        const normalizedRole = role?.trim().toLowerCase();
        if (normalizedRole === 'admin' || normalizedRole === 'user') {
            return normalizedRole;
        }
        if (normalizedRoles.includes('admin')) {
            return 'admin';
        }
        return 'user';
    }
}
