import { useNavigate } from 'react-router-dom';
import { useAuthDependencies } from '../providers/DependencyProvider';

/**
 * useLogout - UI Adapter Hook
 * Connects React components to LogoutUseCase
 * Manages logout flow
 */
export const useLogout = () => {
    const navigate = useNavigate();
    const { logoutUseCase } = useAuthDependencies();

    const logout = async () => {
        try {
            // Execute logout use case
            await logoutUseCase.execute();

            // Navigate to login page
            navigate('/login');
        } catch (err) {
            console.error('Error during logout:', err);
            // Even if logout fails, redirect to login
            navigate('/login');
        }
    };

    return { logout };
};
