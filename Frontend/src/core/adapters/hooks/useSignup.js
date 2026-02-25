import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthDependencies } from '../providers/DependencyProvider';

/**
 * useSignup - UI Adapter Hook
 * Connects React components to RegisterUseCase
 * Manages UI state and orchestrates signup flow
 */
export const useSignup = () => {
    const navigate = useNavigate();
    const { registerUseCase, loginUseCase } = useAuthDependencies();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
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

            // Validate terms accepted
            if (!formData.termsAccepted) {
                throw new Error('Debes aceptar los términos y condiciones');
            }

            // Execute register use case
            await registerUseCase.execute({
                name: formData.fullName,
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
