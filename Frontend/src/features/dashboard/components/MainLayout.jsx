import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

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
