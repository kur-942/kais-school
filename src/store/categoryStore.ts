import { create } from 'zustand';
import { neon } from '@neondatabase/serverless';

export interface Category {
  id: number;
  name: string;
  course_count?: number;
}

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
  fetchCategoriesByNiveau: (niveau: string) => Promise<void>;
  selectCategory: (category: Category | null) => void;
}

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_0VnjsJie2DpS@ep-small-term-aiun3ndw-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,

  fetchCategoriesByNiveau: async (niveau: string) => {
    set({ isLoading: true, error: null });
    try {
      // Only fetch categories that have courses for this specific niveau
      const categories = await sql`
        SELECT 
          c.*,
          COUNT(courses.id) as course_count
        FROM categories c
        LEFT JOIN courses ON c.id = courses.category_id AND courses.niveau = ${niveau}
        GROUP BY c.id
        HAVING COUNT(courses.id) > 0
        ORDER BY c.name
      `;
      
      const typedCategories = categories as any[];
      
      const formattedCategories: Category[] = typedCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        course_count: parseInt(cat.course_count) || 0
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

  selectCategory: (category) => {
    set({ selectedCategory: category });
  }
}));