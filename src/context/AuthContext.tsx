import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface AuthContextType {
  user: { 
    id: string; 
    username: string;
    avatarUrl?: string;
    email?: string;
  } | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiService.get('/auth/me');
        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await apiService.post('/auth/login', { username, password });
    if (response.success) {
      setUser(response.data.user);
    }
  };

  const logout = async () => {
    await apiService.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
