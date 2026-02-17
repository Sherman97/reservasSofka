import React from 'react';
import { SignupForm } from '../../components/signup/SignupForm';
import '../../styles/signup/Signup.css';

const SignupPage = () => {
    return (
        <div className="signup-container">
            <div className="signup-left">
                <div className="overlay">
                    <div className="brand">
                        <span className="brand-icon">📅</span>
                        <span className="brand-text">Booking Platform</span>
                    </div>
                    <h1>Gestiona tus recursos internos en un solo lugar.</h1>
                    <p>Reserva salas de conferencias, equipos tecnológicos y espacios de trabajo con facilidad y rapidez.</p>
                </div>
            </div>

            <div className="signup-right">
                <div className="signup-form-wrapper">
                    <h2>Registro de Nuevo Usuario</h2>
                    <p className="subtitle">Crea tu cuenta corporativa para empezar a reservar.</p>

                    <SignupForm />
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
