import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { authApi } from '../services/api';
import { toast } from 'react-toastify';

// Initial auth state
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// Create context
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthState({ ...initialAuthState, loading: false });
        return;
      }

      try {
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setAuthState({
            isAuthenticated: true,
            user: userResponse.data,
            loading: false,
            error: null,
          });
        } else {
          // If token is invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: userResponse.error || 'Authentication failed',
          });
        }
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Authentication error',
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setAuthState({ ...authState, loading: true, error: null });

    try {
      const response = await authApi.login(username, password);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store token and user in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update auth state
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
        });
        
        toast.success('Login successful');
        return true;
      } else {
        setAuthState({
          ...authState,
          loading: false,
          error: response.error || 'Login failed',
        });
        toast.error(response.error || 'Login failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
      setAuthState({
        ...authState,
        loading: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and reset auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      toast.info('Logged out');
    }
  };

  // Provide auth context value
  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 