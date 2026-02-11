import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

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
            const response = await login({ email, password });

            // Check for both success flag and token presence
            if (response.ok && response.data.token) {
                navigate('/dashboard');
            } else {
                setError('No se pudo completar el inicio de sesión');
            }
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
