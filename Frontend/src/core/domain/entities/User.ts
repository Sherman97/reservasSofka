export interface UserProps {
    id: string;
    email: string;
    name: string;
    role?: string;
}

export class User {
    public readonly id: string;
    public readonly email: string;
    public readonly name: string;
    public readonly role: string;

    constructor({ id, email, name, role = 'user' }: UserProps) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
    }

    isAdmin(): boolean {
        return this.role === 'admin';
    }

    isRegularUser(): boolean {
        return this.role === 'user';
    }

    getDisplayName(): string {
        return this.name || this.email;
    }

    isValid(): boolean {
        return !!(this.id && this.email && this.name);
    }

    toJSON(): UserProps {
        return { id: this.id, email: this.email, name: this.name, role: this.role };
    }

    static fromJSON(json: UserProps): User {
        return new User(json);
    }
}
