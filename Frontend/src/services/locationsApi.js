import axios from 'axios';

const locationsApi = axios.create({
    baseURL: import.meta.env.VITE_LOCATIONS_URL || 'http://localhost:3004',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptors for request/response handling (auth tokens)
locationsApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default locationsApi;
