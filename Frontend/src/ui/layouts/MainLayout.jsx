import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import '../styles/layouts/Layout.css';

export const MainLayout = () => {
    return (
        <div className="main-layout">
            <Header />
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};
