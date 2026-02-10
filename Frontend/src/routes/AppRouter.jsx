import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../features/auth';


const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
