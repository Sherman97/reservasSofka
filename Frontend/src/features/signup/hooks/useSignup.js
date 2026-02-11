import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSignup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        department: '',
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
            // TODO: Implement actual signup logic
            console.log('Signup attempt:', formData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate('/dashboard');
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
