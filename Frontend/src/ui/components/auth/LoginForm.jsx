import React from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../../core/adapters/hooks/useLogin';
import '../../styles/auth/Login.css';

export const LoginForm = () => {
    const {
        email,
        password,
        loading,
        error,
        setEmail,
        setPassword,
        handleSubmit
    } = useLogin();

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="email">Email corporativo</label>
                <div className="input-wrapper">
                    <input
                        type="email"
                        id="email"
                        placeholder="ejemplo@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <div className="input-wrapper">
                    <input
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}


            <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>

            <p className="signup-link">
                ¿No tienes cuenta? <a href="/signup">Regístrate aquí</a>
            </p>
        </form>
    );
};
