import client from './client';

// list all users (admin only)
export async function fetchUsers() {
  const res = await client.get('/admin/users');
  return res.data;
}

// create new user (admin only)
export async function createUser(payload) {
  const res = await client.post('/admin/users', payload);
  return res.data;
}

// update user (admin only)
export async function updateUser(id, payload) {
  const res = await client.put(`/admin/users/${id}`, payload);
  return res.data;
}

export async function toggleUserActive(user) {
  const id = user.id || user._id;
  if (!id) throw new Error('User id required');
  const res = await client.put(`/admin/users/${id}`, {
    ...user,
    isActive: !user.isActive,
  });
  return res.data;
}

// deactivate user
export async function deactivateUser(id) {
  const res = await client.delete(`/admin/users/${id}`);
  return res.data;
}
