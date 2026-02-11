import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../auth/services/authService';

export const useSignup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        if (!formData.termsAccepted) {
            setError("Debes aceptar los términos y condiciones");
            setLoading(false);
            return;
        }

        try {
            // Map UI fullName to backend name
            const registrationData = {
                name: formData.fullName,
                email: formData.email,
                password: formData.password
            };

            const response = await register(registrationData);

            if (response.ok) {
                // Success - redirect to login
                navigate('/login', { state: { message: 'Registro exitoso. Por favor inicia sesión.' } });
            } else {
                setError(response.message || 'Error en el registro');
            }
        } catch (err) {
            setError(err.message || 'Error occurred during signup');
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        handleChange,
        handleSignup,
        loading,
        error
    };
};
