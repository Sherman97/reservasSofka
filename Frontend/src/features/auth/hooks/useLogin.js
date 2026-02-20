import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // TODO: Implement actual login logic with authService
            console.log('Login attempt:', { email, password });
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        handleLogin,
        loading,
        error
    };
};
