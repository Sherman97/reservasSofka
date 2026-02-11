import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../features/auth';
import { SignupPage } from '../features/signup';
import { DashboardPage } from '../features/dashboard';
import { MainLayout } from '../features/dashboard/components/MainLayout';
import { MyReservationsPage } from '../features/reservations/pages/MyReservationsPage';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected Routes with Layout */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/my-reservations" element={<MyReservationsPage />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRouter;
