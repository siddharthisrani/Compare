import axios from 'axios';
import { _logout } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: 'http://localhost:5000/api' || '/api',
  timeout: 0,
});

// attach token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// handle 401
client.interceptors.response.use((r) => r, (err) => {
  if (err?.response?.status === 401) {
    _logout();
    // optional: redirect handled by AuthProvider
  }
  return Promise.reject(err);
});

export default client;
