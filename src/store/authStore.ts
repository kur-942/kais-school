import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

export interface User {
  id: number;
  name: string;
  email: string;
  niveau: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, niveau: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

const DATABASE_URL = import.meta.env.VITE_URL;
// Add the configuration to disable the warning
const sql = neon(DATABASE_URL, {
  disableWarningInBrowsers: true
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      initialized: false,

      checkAuth: async () => {
        const token = localStorage.getItem('auth-storage') 
          ? JSON.parse(localStorage.getItem('auth-storage')!).state?.token 
          : null;
        
        if (!token) {
          set({ initialized: true, isLoading: false });
          return;
        }

        try {
          const users = await sql`SELECT id, name, email, niveau FROM users WHERE token = ${token}`;
          const typedUsers = users as any[];
          
          if (typedUsers && typedUsers.length > 0) {
            const userData = typedUsers[0];
            set({ 
              user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                niveau: userData.niveau
              },
              token,
              initialized: true,
              isLoading: false 
            });
          } else {
            localStorage.removeItem('auth-storage');
            set({ user: null, token: null, initialized: true, isLoading: false });
          }
        } catch (error) {
          console.error('Auth check error:', error);
          localStorage.removeItem('auth-storage');
          set({ user: null, token: null, initialized: true, isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const users = await sql`SELECT * FROM users WHERE email = ${email}`;
          const typedUsers = users as any[];

          if (!typedUsers || typedUsers.length === 0) {
            throw new Error('Invalid credentials');
          }

          const user = typedUsers[0];
          const isValidPassword = await bcrypt.compare(password, user.password);
          
          if (!isValidPassword) {
            throw new Error('Invalid credentials');
          }

          const token = btoa(`${user.id}:${Date.now()}`);
          await sql`UPDATE users SET token = ${token} WHERE id = ${user.id}`;

          set({ 
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              niveau: user.niveau
            },
            token, 
            isLoading: false, 
            error: null 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Login failed', 
            isLoading: false 
          });
        }
      },

      register: async (name: string, email: string, password: string, niveau: string) => {
        set({ isLoading: true, error: null });
        try {
          const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
          const typedExisting = existingUsers as any[];

          if (typedExisting && typedExisting.length > 0) {
            throw new Error('User already exists');
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          const token = btoa(`${email}:${Date.now()}`);

          const newUsers = await sql`
            INSERT INTO users (name, email, password, niveau, token) 
            VALUES (${name}, ${email}, ${hashedPassword}, ${niveau}, ${token})
            RETURNING id, name, email, niveau
          `;
          
          const typedNewUsers = newUsers as any[];

          if (!typedNewUsers || typedNewUsers.length === 0) {
            throw new Error('Failed to create user');
          }

          const createdUser = typedNewUsers[0];
          
          set({ 
            user: {
              id: createdUser.id,
              name: createdUser.name,
              email: createdUser.email,
              niveau: createdUser.niveau
            },
            token, 
            isLoading: false, 
            error: null 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Registration failed', 
            isLoading: false 
          });
        }
      },

      logout: () => {
        localStorage.removeItem('auth-storage');
        set({ user: null, token: null, error: null, isLoading: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);