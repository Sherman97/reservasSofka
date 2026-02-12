
import axios from 'axios';

const inventoryApi = axios.create({
    baseURL: import.meta.env.VITE_INVENTORY_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptors for request/response handling (auth tokens)
inventoryApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default inventoryApi;
