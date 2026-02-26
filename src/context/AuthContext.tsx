import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore, type User } from './../store/authStore';
import { neon } from '@neondatabase/serverless';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, niveau: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authStore = useAuthStore();

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token && !authStore.user) {
        try {
          const DATABASE_URL = import.meta.env.VITE_URL
          const sql = neon(DATABASE_URL);
          
          // Query user by token
          const users = await sql`SELECT id, name, email, niveau FROM users WHERE token = ${token}`;
          
          // Type assertion for the result
          const typedUsers = users as any[];
          
          if (typedUsers && typedUsers.length > 0) {
            const userData = typedUsers[0];
            
            // Create properly typed user object
            const verifiedUser: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              niveau: userData.niveau
            };
            
            // Update the user in the store
            useAuthStore.setState({ user: verifiedUser });
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Token verification error:', error);
          localStorage.removeItem('token');
        }
      }
    };

    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={authStore}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};