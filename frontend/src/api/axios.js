import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api'),
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
