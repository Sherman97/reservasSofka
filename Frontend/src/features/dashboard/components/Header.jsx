import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import logoLight from '../../../assets/LogoSofka_FondoBlanco_peq.png';
import logoDark from '../../../assets/LogoSofka_FondoNegro_peq.png';

export const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        navigate('/login');
    };

    const toggleMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    return (
        <header className="dashboard-header">
            <div className="container">
                <div className="header-left">
                    <img
                        src={theme === 'light' ? logoLight : logoDark}
                        alt="Sofka Logo"
                        className="header-logo"
                    />
                    <h1 className="logo-text">Reservas casa Sofka</h1>
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
                    <button onClick={toggleTheme} className="icon-btn">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <div className="user-profile-wrapper" ref={menuRef}>
                        <div
                            className={`user-profile ${showUserMenu ? 'active' : ''}`}
                            onClick={toggleMenu}
                        >
                            <div className="user-info">
                                <span className="user-name">Juan Pérez</span>
                            </div>
                            <div className="user-avatar">JP</div>
                            <span className="dropdown-chevron">▾</span>
                        </div>
                        {/*La IA dejo el contenido del dropdown oculto y dicha funcionalidad se ejecutaba solo con pulsar el nombre del usuario*/}
                        {showUserMenu && (
                            <div className="user-dropdown">
                                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                                    <span className="dropdown-icon">🚪</span>
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
