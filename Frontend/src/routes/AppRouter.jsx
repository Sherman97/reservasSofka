import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../features/auth';
import { SignupPage } from '../features/signup';
import { DashboardPage } from '../features/dashboard';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
