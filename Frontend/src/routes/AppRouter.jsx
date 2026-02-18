import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../ui/pages/auth/LoginPage';
import SignupPage from '../ui/pages/signup/SignupPage';
import DashboardPage from '../ui/pages/dashboard/DashboardPage';
import { MainLayout } from '../ui/layouts/MainLayout';
import { MyReservationsPage } from '../ui/pages/reservations/MyReservationsPage';
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
