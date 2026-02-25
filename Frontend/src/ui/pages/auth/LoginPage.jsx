import React from 'react';
import { LoginForm } from '../../components/auth/LoginForm';
import '../../styles/auth/Login.css';

const LoginPage = () => {

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="overlay">
                    <h1>Optimiza tu espacio de trabajo</h1>
<<<<<<< HEAD
                    <p>Reserva salas de juntas y equipo tecnológico<br />de forma rápida y eficiente en un solo lugar.</p>
=======
                    <p>Reserva salas de juntas y equipo tecnologico<br />de forma rapida y eficiente en un solo lugar.</p>
>>>>>>> origin/develop
                </div>
            </div>

            <div className="login-right">
                <div className="login-form-wrapper">
                    <div className="logo-container">
<<<<<<< HEAD
                        <div className="logo-icon">📅</div>
=======
                        <div className="logo-icon">RS</div>
>>>>>>> origin/develop
                        <span className="logo-text">Reservas Sofka</span>
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
