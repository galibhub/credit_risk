import api from '../api/client';

export async function loginUser(credentials) {
  const response = await api.post('/auth/login', credentials);
  return response.data;
}

export async function registerUser(payload) {
  const response = await api.post('/auth/register', payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}