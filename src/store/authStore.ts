import { create } from 'zustand';
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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, niveau: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Initialize Neon with environment variable
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_0VnjsJie2DpS@ep-small-term-aiun3ndw-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Query user from database with proper typing
      const users = await sql`SELECT * FROM users WHERE email = ${email}`;
      
      // Type assertion for the result
      const typedUsers = users as any[];

      if (!typedUsers || typedUsers.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = typedUsers[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate simple token (in production, use proper JWT)
      const token = btoa(`${user.id}:${Date.now()}`);
      
      // Update token in database
      await sql`UPDATE users SET token = ${token} WHERE id = ${user.id}`;

      // Create properly typed user object
      const authenticatedUser: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        niveau: user.niveau
      };
      
      localStorage.setItem('token', token);
      
      set({ 
        user: authenticatedUser, 
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
      // Check if user exists
      const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
      const typedExistingUsers = existingUsers as any[];

      if (typedExistingUsers && typedExistingUsers.length > 0) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate token
      const token = btoa(`${email}:${Date.now()}`);

      // Create user and get the returned data
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
      
      // Create properly typed user object
      const newUser: User = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        niveau: createdUser.niveau
      };
      
      localStorage.setItem('token', token);
      
      set({ 
        user: newUser, 
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
    localStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));