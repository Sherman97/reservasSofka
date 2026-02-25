import { User } from '../../core/domain/entities/User';
import type { UserProps } from '../../core/domain/entities/User';

interface UserDTO {
    id: string;
    email: string;
    name?: string;
    username?: string;
    fullName?: string;
    role?: string;
}

export class UserMapper {
    static toDomain(dto: UserDTO): User | null {
        if (!dto) return null;
        return new User({
            id: dto.id,
            email: dto.email,
            name: dto.name || dto.username || dto.fullName || '',
            role: dto.role || 'user'
        });
    }

    static toDTO(user: User): UserProps | null {
        if (!user) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
    }

    static toDomainList(dtos: UserDTO[]): User[] {
        if (!Array.isArray(dtos)) return [];
        return dtos.map(dto => this.toDomain(dto)).filter((u): u is User => u !== null);
    }

    static toDTOList(users: User[]): UserProps[] {
        if (!Array.isArray(users)) return [];
        return users.map(user => this.toDTO(user)).filter((u): u is UserProps => u !== null);
    }
}
