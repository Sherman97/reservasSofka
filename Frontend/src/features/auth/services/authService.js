import api from '../../../services/api';

export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        if (response.data.ok && response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error de conexión' };
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error de conexión' };
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error de conexión' };
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
