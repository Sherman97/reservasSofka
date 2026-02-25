import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthDependencies } from '../providers/DependencyProvider';

interface SignupFormData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
}

interface UseSignupReturn {
    formData: SignupFormData;
    loading: boolean;
    error: string;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: FormEvent) => Promise<void>;
}

export const useSignup = (): UseSignupReturn => {
    const navigate = useNavigate();
    const { registerUseCase, loginUseCase } = useAuthDependencies();

    const [formData, setFormData] = useState<SignupFormData>({
        fullName: '', email: '', password: '', confirmPassword: '', termsAccepted: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (formData.password !== formData.confirmPassword) throw new Error('Las contraseñas no coinciden');
            if (!formData.termsAccepted) throw new Error('Debes aceptar los términos y condiciones');

            await registerUseCase.execute({ name: formData.fullName, email: formData.email, password: formData.password });
            await loginUseCase.execute({ email: formData.email, password: formData.password });
            navigate('/dashboard');
        } catch (err) {
            setError((err as Error).message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return { formData, loading, error, handleChange, handleSubmit };
};
