import { useNavigate } from 'react-router-dom';
import { useAuthDependencies } from '../providers/DependencyProvider';

interface UseLogoutReturn {
    logout: () => Promise<void>;
}

export const useLogout = (): UseLogoutReturn => {
    const navigate = useNavigate();
    const { logoutUseCase } = useAuthDependencies();

    const logout = async (): Promise<void> => {
        try {
            await logoutUseCase.execute();
            navigate('/login');
        } catch (err) {
            console.error('Error during logout:', err);
            navigate('/login');
        }
    };

    return { logout };
};
