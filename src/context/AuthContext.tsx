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
      // 移除设置X-User-Info头的旧逻辑
    }
  };

  const logout = async () => {
    try {
      await apiService.post('/auth/logout');
    } finally {
      setUser(null);
      // 清除所有cookie
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 存储登出函数引用
let logoutRef: (() => Promise<void>) | null = null;

// 标准认证Hook
export const useAuth = () => {
  const auth = useContext(AuthContext);
  logoutRef = auth.logout; // 更新全局引用
  return auth;
};

// 供API服务使用的独立登出方法
export const triggerLogout = async () => {
  try {
    if (logoutRef) {
      await logoutRef();
    }
    // 确保清除所有认证相关cookie
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // 直接跳转，避免React Router依赖
    window.location.href = '/login?from=' + encodeURIComponent(window.location.pathname);
  } catch (error) {
    console.error('登出过程中发生错误:', error);
    window.location.href = '/login';
  }
};
