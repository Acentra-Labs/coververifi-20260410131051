import { createContext, useContext, useState, useCallback } from 'react';
import { demoUsers } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('cv_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((email, password) => {
    const found = demoUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { success: false, error: 'Invalid email or password' };

    const { password: _, ...userData } = found;
    setUser(userData);
    sessionStorage.setItem('cv_user', JSON.stringify(userData));
    return { success: true, user: userData };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('cv_user');
  }, []);

  const isConsultant = user?.role === 'consultant';
  const isGC = user?.role === 'gc';

  return (
    <AuthContext.Provider value={{ user, login, logout, isConsultant, isGC }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
