import axios from 'axios';

const bookingsApi = axios.create({
    baseURL: import.meta.env.VITE_BOOKINGS_URL || 'http://localhost:3002',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptors for request/response handling (auth tokens)
bookingsApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('BookingsAPI - Token from localStorage:', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('BookingsAPI - Authorization Header attached:', config.headers.Authorization);
        } else {
            console.warn('BookingsAPI - No token found in localStorage');
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default bookingsApi;
