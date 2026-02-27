import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthDependencies } from '../providers/DependencyProvider';

interface UseLoginReturn {
    email: string;
    password: string;
    loading: boolean;
    error: string;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    handleSubmit: (e: FormEvent) => Promise<void>;
}

export const useLogin = (): UseLoginReturn => {
    const navigate = useNavigate();
    const { loginUseCase } = useAuthDependencies();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await loginUseCase.execute({ email, password });
            navigate('/dashboard');
        } catch (err) {
            setError((err as Error).message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return { email, password, loading, error, setEmail, setPassword, handleSubmit };
};
