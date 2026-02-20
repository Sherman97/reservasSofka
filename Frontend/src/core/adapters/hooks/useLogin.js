import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthDependencies } from './useDependencies';

/**
 * useLogin - UI Adapter Hook
 * Connects React components to LoginUseCase
 * Manages UI state and orchestrates login flow
 */
export const useLogin = () => {
    const navigate = useNavigate();
    const { loginUseCase } = useAuthDependencies();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Execute use case
            await loginUseCase.execute({ email, password });

            // Success - navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            // Handle errors
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        password,
        loading,
        error,
        setEmail,
        setPassword,
        handleSubmit
    };
};
