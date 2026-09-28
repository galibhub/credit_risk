import api from '../api/client';

// Fetch actual administrative statistics
export async function getAdminStats({ signal } = {}) {
  const { data } = await api.get('/admin/stats', {
    signal,
  });

  return data;
}

// Fetch users with server-side pagination
export async function getAdminUsers({
  limit = 20,
  skip = 0,
  signal,
} = {}) {
  const { data } = await api.get('/admin/users', {
    params: { limit, skip },
    signal,
  });

  return data;
}