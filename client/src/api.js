export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !path.startsWith('/auth')) {
    localStorage.removeItem('token');
    window.location.assign('/login');
    throw new Error('Session expired, please sign in again');
  }
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}
