import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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
    console.log('登录结果:', response);
    if (response.success) {
      console.log('登录成功: ', response.data.user);
      setUser(response.data.user);
    } else {
      console.error('登录失败: ', response.message);
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
let navigateRef: ((path: string) => void) | null = null;

// 标准认证Hook
export const useAuth = () => {
  const auth = useContext(AuthContext);
  logoutRef = auth.logout; // 更新全局引用
  return auth;
};

// 设置导航函数（在App.tsx中调用）
export const setNavigateFunction = (navigate: (path: string) => void) => {
  navigateRef = navigate;
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
    
    // 使用React Router导航（如果可用），否则回退到window.location
    if (navigateRef) {
      navigateRef('/login?from=' + encodeURIComponent(window.location.pathname));
    } else {
      window.location.href = '/login?from=' + encodeURIComponent(window.location.pathname);
    }
  } catch (error) {
    console.error('登出过程中发生错误:', error);
    if (navigateRef) {
      navigateRef('/login');
    } else {
      window.location.href = '/login';
    }
  }
};
