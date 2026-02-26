import { create } from 'zustand';
import { neon } from '@neondatabase/serverless';

export interface Course {
  id: number;
  title: string;
  description: string;
  niveau: string;
  category_id: number;
  category_name?: string;
  content_type: 'video' | 'text' | 'image' | 'pdf';
  content_url: string;
  created_at: string;
}

interface CourseFilters {
  search?: string;
  contentType?: string[];
  categoryId?: number;
}

interface CourseState {
  courses: Course[];
  filteredCourses: Course[];
  displayedCourses: Course[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  pageSize: number;
  filters: CourseFilters;
  currentNiveau: string | null;
  
  fetchCoursesByNiveau: (niveau: string, categoryId?: number) => Promise<void>;
  applyFilters: () => void;
  setFilter: <K extends keyof CourseFilters>(key: K, value: CourseFilters[K]) => void;
  clearFilters: () => void;
  loadMore: () => void;
  resetCourses: () => void;
}

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_0VnjsJie2DpS@ep-small-term-aiun3ndw-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  filteredCourses: [],
  displayedCourses: [],
  isLoading: false,
  error: null,
  hasMore: true,
  page: 0,
  pageSize: 6,
  currentNiveau: null,
  filters: {
    search: '',
    contentType: [],
    categoryId: undefined
  },

  fetchCoursesByNiveau: async (niveau: string, categoryId?: number) => {
    set({ isLoading: true, error: null, currentNiveau: niveau });
    try {
      let query;
      if (categoryId) {
        query = await sql`
          SELECT 
            c.*,
            cat.name as category_name
          FROM courses c
          JOIN categories cat ON c.category_id = cat.id
          WHERE c.niveau = ${niveau} AND c.category_id = ${categoryId}
          ORDER BY c.created_at DESC
        `;
      } else {
        query = await sql`
          SELECT 
            c.*,
            cat.name as category_name
          FROM courses c
          JOIN categories cat ON c.category_id = cat.id
          WHERE c.niveau = ${niveau}
          ORDER BY c.created_at DESC
        `;
      }
      
      const typedCourses = query as any[];
      
      const formattedCourses: Course[] = typedCourses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        niveau: course.niveau,
        category_id: course.category_id,
        category_name: course.category_name,
        content_type: course.content_type,
        content_url: course.content_url,
        created_at: course.created_at
      }));

      const filters = { ...get().filters, categoryId };
      
      set({ 
        courses: formattedCourses,
        filters,
        page: 0,
        isLoading: false 
      });
      
      // Apply filters after setting courses
      get().applyFilters();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch courses', 
        isLoading: false 
      });
    }
  },

  applyFilters: () => {
    const { courses, filters, pageSize } = get();
    
    let filtered = [...courses];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply content type filter
    if (filters.contentType && filters.contentType.length > 0) {
      filtered = filtered.filter(course => 
        filters.contentType!.includes(course.content_type)
      );
    }
    
    // Apply category filter
    if (filters.categoryId) {
      filtered = filtered.filter(course => 
        course.category_id === filters.categoryId
      );
    }
    
    const page = 0;
    const end = (page + 1) * pageSize;
    const displayedCourses = filtered.slice(0, end);
    
    set({ 
      filteredCourses: filtered,
      displayedCourses,
      page: 0,
      hasMore: end < filtered.length
    });
  },

  setFilter: (key, value) => {
    set(state => ({
      filters: { ...state.filters, [key]: value }
    }));
    get().applyFilters();
  },

  clearFilters: () => {
    set({
      filters: {
        search: '',
        contentType: [],
        categoryId: undefined
      }
    });
    get().applyFilters();
  },

  loadMore: () => {
    const { page, pageSize, filteredCourses } = get();
    const nextPage = page + 1;
    const end = (nextPage + 1) * pageSize;
    
    const newDisplayedCourses = filteredCourses.slice(0, end);
    
    set({ 
      displayedCourses: newDisplayedCourses,
      page: nextPage,
      hasMore: end < filteredCourses.length
    });
  },

  resetCourses: () => {
    set({ 
      courses: [], 
      filteredCourses: [],
      displayedCourses: [], 
      page: 0, 
      hasMore: true,
      currentNiveau: null,
      filters: {
        search: '',
        contentType: [],
        categoryId: undefined
      }
    });
  }
}));