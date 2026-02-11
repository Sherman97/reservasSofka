import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';

export const Header = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="dashboard-header">
            <div className="header-left">
                <div className="logo-icon">📦</div>
                <h1 className="logo-text">Explorador de Inventario</h1>
                <nav className="header-nav">
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                        Explorar
                    </NavLink>
                    <NavLink to="/my-reservations" className={({ isActive }) => isActive ? "active" : ""}>
                        Mis Reservas
                    </NavLink>
                </nav>
            </div>
            <div className="header-right">
                {/* <button onClick={toggleTheme} className="icon-btn">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button> */}
                <div className="user-profile">
                    <div className="user-info">
                        <span className="user-name">Juan Pérez</span>
                        <span className="user-role">Administrador</span>
                    </div>
                    <div className="user-avatar">JP</div>
                </div>
            </div>
        </header>
    );
};
