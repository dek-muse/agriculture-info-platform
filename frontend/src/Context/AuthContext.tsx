/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';

type UserRole = 'user' | 'admin' | 'superadmin' | 'workers' | 'moderator';

interface User {
 
  _id: string;
  name: string;
  email: string;
  subcity?: string;
  role: UserRole;
  avatar: string;

}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  loading: boolean; // ✅ added
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // Load auth from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (err) {
      console.error('Error loading auth data from localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (loading) return;

    const publicRoutes = ['/auth/signin', '/auth/signup'];
    const isPublic = publicRoutes.includes(pathname);

    if (!token && !isPublic) {
      router.push('/auth/signin');
    }

    if (token && isPublic) {
      router.push('/dashboard'); // Logged in redirect page
    }
  }, [loading, token, pathname, router]);

  // Auto logout after 3 hours inactivity (you can increase this)
  useEffect(() => {
    if (!user || !token) return;

    const lastActivity = localStorage.getItem('lastActivity');
    const now = Date.now();
    const inactivityLimit = 3 * 60 * 60 * 1000; // 3 hours in ms

    if (lastActivity && now - parseInt(lastActivity) > inactivityLimit) {
      logout();
      return;
    }

    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    updateActivity();

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [user, token]);

  const login = (userData: User, userToken: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    localStorage.setItem('lastActivity', Date.now().toString());
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('lastActivity');
    setUser(null);
    setToken(null);
    router.push('/auth/signin');
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      login,
      logout,
      hasRole,
      loading, // ✅ added,
    }),
    [user, token]
  );

  if (loading)
    return (
      <div className="text-center py-10">
        <section className="min-h-screen flex items-center justify-center bg-gray-200">
          <div className="w-full max-w-xs px-4">
            <div className="relative mx-auto w-full h-auto aspect-[150/73]">
              <svg
                viewBox="0 0 150 73"
                className="w-full h-full stroke-[#009B9E] stroke-3 fill-none"
                xmlns="http://www.w3.org/2000/svg"
                version="1.0"
              >
                <polyline
                  points="0,45.486 38.514,45.486 44.595,33.324 50.676,45.486 57.771,45.486 62.838,55.622 71.959,9 80.067,
                  63.729 84.122,45.486 97.297,45.486 103.379,40.419 110.473,45.486 150,45.486"
                  strokeMiterlimit="10"
                />
              </svg>

              <div className="fade-in absolute top-0 right-0 w-full h-full bg-gray-200 animate-heartRateIn"></div>
              <div className="fade-out absolute top-0 -right-[120%] w-[120%] h-full bg-gray-200 animate-heartRateOut"></div>
            </div>
          </div>
        </section>
      </div>
    );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
