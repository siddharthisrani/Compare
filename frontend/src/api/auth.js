import client from './client';

const STORAGE_USER = 'cc_user';
const STORAGE_TOKEN = 'cc_token';

export async function register(payload) {
  const res = await client.post('/auth/register', payload);
  return res.data;
}

export async function login({ email, password }) {
  const res = await client.post('/auth/login', { email, password });
  const { token, user } = res.data;
  if (!token) throw new Error('No token returned');
  localStorage.setItem(STORAGE_TOKEN, token);
  localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return user;
}

export function logout() {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
  delete client.defaults.headers.common['Authorization'];
  window.location.href = '/login';
}

// silent logout used by client interceptor
export function _logout() {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
  delete client.defaults.headers.common['Authorization'];
}

export function getCurrentUser() {
  const raw = localStorage.getItem(STORAGE_USER);
  return raw ? JSON.parse(raw) : null;
}
