import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { LoginForm } from '../components/LoginForm';
import '../styles/Login.css';

const LoginPage = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="overlay">
                    <h1>Optimiza tu espacio de trabajo</h1>
                    <p>Reserva salas de juntas y equipo tecnológico<br />de forma rápida y eficiente en un solo lugar.</p>
                </div>
            </div>

            <div className="login-right">
                <div className="theme-toggle-container">
                    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>

                <div className="login-form-wrapper">
                    <div className="logo-container">
                        <div className="logo-icon">📅</div>
                        <span className="logo-text">ReservaPro</span>
                    </div>

                    <h2>Bienvenido de nuevo</h2>
                    <p className="subtitle">Ingresa tus credenciales para acceder a la plataforma</p>

                    <LoginForm />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
