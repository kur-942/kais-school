import { create } from 'zustand';
import { neon } from '@neondatabase/serverless';
import type { Course } from './courseStore';

export interface SavedCourse {
  id: number;
  user_id: number;
  course_id: number;
  saved_at: string;
  course?: Course;
}

interface SavedState {
  savedCourses: SavedCourse[];
  savedCourseIds: Set<number>;
  isLoading: boolean;
  error: string | null;
  
  fetchSavedCourses: (userId: number) => Promise<void>;
  saveCourse: (userId: number, courseId: number) => Promise<void>;
  unsaveCourse: (userId: number, courseId: number) => Promise<void>;
  isCourseSaved: (courseId: number) => boolean;
  getSavedCount: () => number;
}

const DATABASE_URL = import.meta.env.VITE_URL;
// Add the configuration to disable the warning
const sql = neon(DATABASE_URL, {
  disableWarningInBrowsers: true
});

export const useSavedStore = create<SavedState>((set, get) => ({
  savedCourses: [],
  savedCourseIds: new Set(),
  isLoading: false,
  error: null,

  fetchSavedCourses: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const saved = await sql`
        SELECT 
          sc.*,
          c.id as course_id,
          c.title as course_title,
          c.description as course_description,
          c.niveau as course_niveau,
          c.content_type as course_content_type,
          c.content_url as course_content_url,
          c.created_at as course_created_at,
          cat.name as category_name
        FROM saved_courses sc
        JOIN courses c ON sc.course_id = c.id
        JOIN categories cat ON c.category_id = cat.id
        WHERE sc.user_id = ${userId}
        ORDER BY sc.saved_at DESC
      `;
      
      const typedSaved = saved as any[];
      
      const formattedSaved: SavedCourse[] = typedSaved.map(item => ({
        id: item.id,
        user_id: item.user_id,
        course_id: item.course_id,
        saved_at: item.saved_at,
        course: {
          id: item.course_id,
          title: item.course_title,
          description: item.course_description,
          niveau: item.course_niveau,
          category_id: item.category_id,
          category_name: item.category_name,
          content_type: item.course_content_type,
          content_url: item.course_content_url,
          created_at: item.course_created_at
        }
      }));

      const savedIds = new Set(formattedSaved.map(s => s.course_id));

      set({ 
        savedCourses: formattedSaved,
        savedCourseIds: savedIds,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch saved courses', 
        isLoading: false 
      });
    }
  },

  saveCourse: async (userId: number, courseId: number) => {
    set({ isLoading: true, error: null });
    try {
      // Check if already saved
      const existing = await sql`
        SELECT id FROM saved_courses 
        WHERE user_id = ${userId} AND course_id = ${courseId}
      `;
      
      const typedExisting = existing as any[];
      
      if (typedExisting.length === 0) {
        // Insert new saved course
        const newSaved = await sql`
          INSERT INTO saved_courses (user_id, course_id)
          VALUES (${userId}, ${courseId})
          RETURNING *
        `;
        
        const typedNewSaved = newSaved as any[];
        
        if (typedNewSaved.length > 0) {
          // Fetch course details
          const courseData = await sql`
            SELECT 
              c.*,
              cat.name as category_name
            FROM courses c
            JOIN categories cat ON c.category_id = cat.id
            WHERE c.id = ${courseId}
          `;
          
          const typedCourse = courseData as any[];
          
          if (typedCourse.length > 0) {
            const course = typedCourse[0];
            const newSavedCourse: SavedCourse = {
              id: typedNewSaved[0].id,
              user_id: userId,
              course_id: courseId,
              saved_at: typedNewSaved[0].saved_at,
              course: {
                id: course.id,
                title: course.title,
                description: course.description,
                niveau: course.niveau,
                category_id: course.category_id,
                category_name: course.category_name,
                content_type: course.content_type,
                content_url: course.content_url,
                created_at: course.created_at
              }
            };
            
            set(state => ({
              savedCourses: [newSavedCourse, ...state.savedCourses],
              savedCourseIds: new Set([...state.savedCourseIds, courseId]),
              isLoading: false
            }));
          }
        }
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to save course', 
        isLoading: false 
      });
    }
  },

  unsaveCourse: async (userId: number, courseId: number) => {
    set({ isLoading: true, error: null });
    try {
      await sql`
        DELETE FROM saved_courses 
        WHERE user_id = ${userId} AND course_id = ${courseId}
      `;
      
      set(state => {
        const newSavedIds = new Set(state.savedCourseIds);
        newSavedIds.delete(courseId);
        
        return {
          savedCourses: state.savedCourses.filter(s => s.course_id !== courseId),
          savedCourseIds: newSavedIds,
          isLoading: false
        };
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to unsave course', 
        isLoading: false 
      });
    }
  },

  isCourseSaved: (courseId: number) => {
    return get().savedCourseIds.has(courseId);
  },

  getSavedCount: () => {
    return get().savedCourses.length;
  }
}));