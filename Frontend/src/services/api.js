import axios from 'axios';
/**
 * La IA hardcodea la URL directamente en el archivo de la peticion a la API, se corrige manualmente.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_BOOKINGS_URL, // Base URL for the API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for request/response handling (e.g., auth tokens)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log("token", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
