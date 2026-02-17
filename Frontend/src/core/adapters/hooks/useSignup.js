import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDependencies } from '../providers/DependencyProvider';

/**
 * useSignup - UI Adapter Hook
 * Connects React components to RegisterUseCase
 * Manages UI state and orchestrates signup flow
 */
export const useSignup = () => {
    const navigate = useNavigate();
    const { registerUseCase, loginUseCase } = useDependencies();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }

            // Execute register use case
            await registerUseCase.execute({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            // After registration, auto-login the user
            await loginUseCase.execute({
                email: formData.email,
                password: formData.password
            });

            // Success - navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        error,
        handleChange,
        handleSubmit
    };
};
