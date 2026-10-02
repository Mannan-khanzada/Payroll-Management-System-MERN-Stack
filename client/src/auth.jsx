import { createContext, useContext, useState } from 'react';
import { api } from './api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(localStorage.getItem('username'));

  async function login(user, pass) {
    const data = await api('/auth/login', { method: 'POST', body: { username: user, password: pass } });
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    setUsername(data.username);
  }
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
  }
  return <AuthCtx.Provider value={{ username, login, logout }}>{children}</AuthCtx.Provider>;
}
