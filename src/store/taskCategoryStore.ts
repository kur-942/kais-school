import { create } from 'zustand';
import { neon } from '@neondatabase/serverless';

export interface TaskCategory {
  id: number;
  user_id: number;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  task_count?: number;
}

export interface TaskCategoryState {
  categories: TaskCategory[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: (userId: number) => Promise<void>;
  addCategory: (userId: number, name: string, color?: string, icon?: string) => Promise<void>;
  updateCategory: (categoryId: number, updates: Partial<TaskCategory>) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;
}

const DATABASE_URL = import.meta.env.VITE_URL;
// Add the configuration to disable the warning
const sql = neon(DATABASE_URL, {
  disableWarningInBrowsers: true
});;

// Predefined icons and colors for categories - MAKE SURE TO EXPORT THESE
export const predefinedIcons = [
  '📚', '💻', '📝', '🧮', '🔬', '🎨', '🌍', '📖', '⚽', '🎵',
  '🏛️', '🧪', '📊', '💭', '🗣️', '📐', '🔭', '🧬', '📜', '🎭'
];

export const predefinedColors = [
  '#10b981', // green
  '#3b82f6', // blue
  '#ef4444', // red
  '#f59e0b', // orange
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#f97316', // orange
  '#6b7280'  // gray
];

export const useTaskCategoryStore = create<TaskCategoryState>((set, _get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const categories = await sql`
        SELECT 
          tc.*,
          COUNT(t.id) as task_count
        FROM task_categories tc
        LEFT JOIN tasks t ON tc.id = t.task_category_id
        WHERE tc.user_id = ${userId}
        GROUP BY tc.id
        ORDER BY tc.name
      `;
      
      const typedCategories = categories as any[];
      
      const formattedCategories: TaskCategory[] = typedCategories.map(cat => ({
        id: cat.id,
        user_id: cat.user_id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        created_at: cat.created_at,
        task_count: parseInt(cat.task_count) || 0
      }));

      set({ 
        categories: formattedCategories,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch categories', 
        isLoading: false 
      });
    }
  },

  addCategory: async (userId: number, name: string, color = '#10b981', icon = '📌') => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await sql`
        INSERT INTO task_categories (user_id, name, color, icon)
        VALUES (${userId}, ${name}, ${color}, ${icon})
        RETURNING *
      `;
      
      const typedNewCategory = newCategory as any[];
      
      if (typedNewCategory && typedNewCategory.length > 0) {
        const created = typedNewCategory[0];
        
        set(state => ({
          categories: [...state.categories, {
            id: created.id,
            user_id: created.user_id,
            name: created.name,
            color: created.color,
            icon: created.icon,
            created_at: created.created_at,
            task_count: 0
          }],
          isLoading: false
        }));
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to add category', 
        isLoading: false 
      });
    }
  },

  updateCategory: async (categoryId: number, updates: Partial<TaskCategory>) => {
    set({ isLoading: true, error: null });
    try {
      // Handle each update field individually to avoid template literal issues
      if (updates.name !== undefined) {
        await sql`UPDATE task_categories SET name = ${updates.name} WHERE id = ${categoryId}`;
      }
      if (updates.color !== undefined) {
        await sql`UPDATE task_categories SET color = ${updates.color} WHERE id = ${categoryId}`;
      }
      if (updates.icon !== undefined) {
        await sql`UPDATE task_categories SET icon = ${updates.icon} WHERE id = ${categoryId}`;
      }
      
      set(state => ({
        categories: state.categories.map(cat => 
          cat.id === categoryId ? { ...cat, ...updates } : cat
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update category', 
        isLoading: false 
      });
    }
  },

  deleteCategory: async (categoryId: number) => {
    set({ isLoading: true, error: null });
    try {
      await sql`
        DELETE FROM task_categories WHERE id = ${categoryId}
      `;
      
      set(state => ({
        categories: state.categories.filter(cat => cat.id !== categoryId),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete category', 
        isLoading: false 
      });
    }
  }
}));