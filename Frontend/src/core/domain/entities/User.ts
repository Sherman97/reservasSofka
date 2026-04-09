export interface UserProps {
    id: string;
    email: string;
    name: string;
    role?: string;
    roles?: string[];
}

export class User {
    public readonly id: string;
    public readonly email: string;
    public readonly name: string;
    public readonly role: string;
    public readonly roles: string[];

    constructor({ id, email, name, role = 'user', roles = [] }: UserProps) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role.toLowerCase();
        this.roles = this.normalizeRoles(roles, this.role);
    }

    isAdmin(): boolean {
        return this.hasRole('admin');
    }

    isRegularUser(): boolean {
        return this.role === 'user' && !this.isAdmin();
    }

    hasRole(role: string): boolean {
        return this.roles.includes(role.toLowerCase());
    }

    getDisplayName(): string {
        return this.name || this.email;
    }

    isValid(): boolean {
        return !!(this.id && this.email && this.name);
    }

    toJSON(): UserProps {
        return { id: this.id, email: this.email, name: this.name, role: this.role, roles: this.roles };
    }

    static fromJSON(json: UserProps): User {
        return new User(json);
    }

    private normalizeRoles(roles: string[], fallbackRole: string): string[] {
        const normalized = roles
            .filter((role) => typeof role === 'string' && role.trim().length > 0)
            .map((role) => role.trim().toLowerCase());

        if (!normalized.includes(fallbackRole)) {
            normalized.push(fallbackRole);
        }

        return Array.from(new Set(normalized));
    }
}
