import React from 'react';
import { FaUser, FaLock, FaRedo } from 'react-icons/fa';
import { useSignup } from '../../../core/adapters/hooks/useSignup';
import '../../styles/signup/Signup.css';

export const SignupForm = () => {
    const { formData, handleChange, handleSubmit, loading, error } = useSignup();

    return (
        <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
                <label htmlFor="fullName">Nombre Completo</label>
                <div className="input-wrapper">
                    <FaUser className="input-icon" size={18} />
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        placeholder="Ej. Juan Pérez"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="email">Email Corporativo</label>
                <div className="input-wrapper">
                    <span className="input-icon">@</span>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="usuario@empresa.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>


            <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-wrapper">
                    <FaLock className="input-icon" size={18} />
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <div className="input-wrapper">
                    <FaRedo className="input-icon" size={18} />
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-check">
                <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    required
                />
                <label htmlFor="termsAccepted">
                    Acepto los <a href="#">términos de servicio</a> y la <a href="#">política de privacidad</a>.
                </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>

            <p className="login-link">
                ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
            </p>
        </form>
    );
};
