import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../core/adapters/providers/ThemeContext';
import { useAuthDependencies } from '../../../core/adapters/hooks/useDependencies';
import logoLight from '../../../assets/LogoSofka_FondoBlanco_peq.png';
import logoDark from '../../../assets/LogoSofka_FondoNegro_peq.png';
import '../../styles/common/Header.css';

export const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { logoutUseCase } = useAuthDependencies();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Get user from localStorage - should eventually be handled by auth context/hook
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Usuario' };

    const handleLogout = async () => {
        if (logoutUseCase) {
            await logoutUseCase.execute();
        } else {
            // Fallback if use case not available (though it should be)
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
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
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }
        };

        if (showUserMenu || mobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu, mobileMenuOpen]);

    return (
        <header className="dashboard-header">
            <div className="container">
                <div className="header-left">
                    <img
                        src={theme === 'light' ? logoLight : logoDark}
                        alt="Sofka Logo"
                        className="header-logo"
                    />
                    <h1 className="logo-text">Reservas Casa Sofka</h1>
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
                                <span className="user-name">{user.username || user.name}</span>
                            </div>
                            <span className="dropdown-chevron">▾</span>
                        </div>
                        {showUserMenu && (
                            <div className="user-dropdown">
                                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                                    <span className="dropdown-icon">🚪</span>
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Hamburger button - visible only on mobile */}
                    <div className="hamburger-wrapper" ref={mobileMenuRef}>
                        <button
                            className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Menú de navegación"
                        >
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                        </button>
                        {mobileMenuOpen && (
                            <div className="mobile-dropdown">
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) => `mobile-dropdown-item ${isActive ? 'active' : ''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="dropdown-icon">🔍</span>
                                    Explorar
                                </NavLink>
                                <NavLink
                                    to="/my-reservations"
                                    className={({ isActive }) => `mobile-dropdown-item ${isActive ? 'active' : ''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="dropdown-icon">📋</span>
                                    Mis Reservas
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
