import axios from 'axios';
/**
 * La IA hardcodea la URL directamente en el archivo de la peticion a la API, se corrige manualmente.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000', // Base URL for the API (Gateway/Auth)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for request/response handling (e.g., auth tokens)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
