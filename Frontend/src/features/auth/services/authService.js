import api from '../../../services/api';

export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        // Only save if ok is true AND there is a non-empty token
        if (response.data.ok && response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
            return response.data;
        } else {
            // Throw error if token is missing even if ok is true
            throw { message: response.data.message || 'Error de autenticación: No se recibió un token válido' };
        }
    } catch (error) {
        throw error.response?.data || error || { message: 'Error de conexión' };
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
