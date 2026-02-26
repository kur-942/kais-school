import { create } from 'zustand';
import { neon } from '@neondatabase/serverless';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  task_type: 'todo' | 'exam';
  category_id: number | null;
  exam_id: number | null;
  is_done: boolean;
  due_date: string | null;
  created_at: string;
  // Joined field
  category_name?: string;
}

export interface Exam {
  id: number;
  user_id: number;
  name: string;
  subject: string;
  exam_date: string;
  description: string | null;
  created_at: string;
}

export type NewTask = Omit<Task, 'id' | 'created_at' | 'category_name'>;
export type NewExam = Omit<Exam, 'id' | 'created_at'>;

interface TaskState {
  tasks: Task[];
  exams: Exam[];
  filteredTasks: Task[];
  displayedTasks: Task[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  pageSize: number;
  filters: {
    taskType: 'all' | 'todo' | 'exam';
    categoryId: number | null;
    isDone: boolean | null;
  };
  
  fetchTasks: (userId: number) => Promise<void>;
  fetchExams: (userId: number) => Promise<void>;
  addTask: (task: NewTask) => Promise<void>;
  addExam: (exam: NewExam) => Promise<void>;
  updateTask: (taskId: number, updates: Partial<Task>) => Promise<void>;
  updateExam: (examId: number, updates: Partial<Exam>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  deleteExam: (examId: number) => Promise<void>;
  toggleTaskDone: (taskId: number, isDone: boolean) => Promise<void>;
  setFilter: <K extends keyof TaskState['filters']>(key: K, value: TaskState['filters'][K]) => void;
  applyFilters: () => void;
  loadMore: () => void;
  resetFilters: () => void;
}

const DATABASE_URL = import.meta.env.VITE_URL;
const sql = neon(DATABASE_URL);

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  exams: [],
  filteredTasks: [],
  displayedTasks: [],
  isLoading: false,
  error: null,
  hasMore: true,
  page: 0,
  pageSize: 10,
  filters: {
    taskType: 'all',
    categoryId: null,
    isDone: null
  },

  fetchTasks: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await sql`
        SELECT 
          t.*,
          c.name as category_name
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ${userId}
        ORDER BY 
          CASE WHEN t.is_done THEN 1 ELSE 0 END,
          CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
          t.due_date ASC,
          t.created_at DESC
      `;
      
      const typedTasks = tasks as any[];
      
      const formattedTasks: Task[] = typedTasks.map(task => ({
        id: task.id,
        user_id: task.user_id,
        title: task.title,
        description: task.description,
        task_type: task.task_type,
        category_id: task.category_id,
        exam_id: task.exam_id,
        is_done: task.is_done,
        due_date: task.due_date,
        created_at: task.created_at,
        category_name: task.category_name
      }));

      set({ 
        tasks: formattedTasks,
        isLoading: false 
      });
      
      get().applyFilters();
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      set({ 
        error: error.message || 'Failed to fetch tasks', 
        isLoading: false 
      });
    }
  },

  fetchExams: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const exams = await sql`
        SELECT * FROM exams 
        WHERE user_id = ${userId}
        ORDER BY exam_date ASC, created_at DESC
      `;
      
      const typedExams = exams as any[];
      
      const formattedExams: Exam[] = typedExams.map(exam => ({
        id: exam.id,
        user_id: exam.user_id,
        name: exam.name,
        subject: exam.subject,
        exam_date: exam.exam_date,
        description: exam.description,
        created_at: exam.created_at
      }));

      set({ 
        exams: formattedExams,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error fetching exams:', error);
      set({ 
        error: error.message || 'Failed to fetch exams', 
        isLoading: false 
      });
    }
  },

  addTask: async (task: NewTask) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Adding task:', task);
      
      const result = await sql`
        INSERT INTO tasks (
          user_id, 
          title, 
          description, 
          task_type, 
          category_id, 
          exam_id, 
          is_done, 
          due_date
        ) VALUES (
          ${task.user_id}, 
          ${task.title}, 
          ${task.description}, 
          ${task.task_type}, 
          ${task.category_id}, 
          ${task.exam_id}, 
          ${task.is_done}, 
          ${task.due_date}
        )
        RETURNING *
      `;
      
      const typedResult = result as any[];
      console.log('Task added:', typedResult);
      
      if (typedResult && typedResult.length > 0) {
        const createdTask = typedResult[0];
        
        // Fetch course category name if exists
        let categoryName = null;
        if (createdTask.category_id) {
          const courseCat = await sql`
            SELECT name FROM categories WHERE id = ${createdTask.category_id}
          `;
          const typedCourseCat = courseCat as any[];
          if (typedCourseCat.length > 0) {
            categoryName = typedCourseCat[0].name;
          }
        }
        
        const newTask: Task = {
          id: createdTask.id,
          user_id: createdTask.user_id,
          title: createdTask.title,
          description: createdTask.description,
          task_type: createdTask.task_type,
          category_id: createdTask.category_id,
          exam_id: createdTask.exam_id,
          is_done: createdTask.is_done,
          due_date: createdTask.due_date,
          created_at: createdTask.created_at,
          category_name: categoryName
        };
        
        set(state => ({
          tasks: [...state.tasks, newTask],
          isLoading: false,
          error: null
        }));
        
        get().applyFilters();
      }
    } catch (error: any) {
      console.error('Error adding task:', error);
      set({ 
        error: error.message || 'Failed to add task', 
        isLoading: false 
      });
    }
  },

  addExam: async (exam: NewExam) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Adding exam:', exam);
      
      const result = await sql`
        INSERT INTO exams (
          user_id, 
          name, 
          subject, 
          exam_date, 
          description
        ) VALUES (
          ${exam.user_id}, 
          ${exam.name}, 
          ${exam.subject}, 
          ${exam.exam_date}, 
          ${exam.description}
        )
        RETURNING *
      `;
      
      const typedResult = result as any[];
      console.log('Exam added:', typedResult);
      
      if (typedResult && typedResult.length > 0) {
        const createdExam: Exam = {
          id: typedResult[0].id,
          user_id: typedResult[0].user_id,
          name: typedResult[0].name,
          subject: typedResult[0].subject,
          exam_date: typedResult[0].exam_date,
          description: typedResult[0].description,
          created_at: typedResult[0].created_at
        };
        
        set(state => ({
          exams: [...state.exams, createdExam],
          isLoading: false,
          error: null
        }));
      }
    } catch (error: any) {
      console.error('Error adding exam:', error);
      set({ 
        error: error.message || 'Failed to add exam', 
        isLoading: false 
      });
    }
  },

  updateTask: async (taskId: number, updates: Partial<Task>) => {
    set({ isLoading: true, error: null });
    try {
      // Handle each update field individually
      if (updates.title !== undefined) {
        await sql`UPDATE tasks SET title = ${updates.title} WHERE id = ${taskId}`;
      }
      if (updates.description !== undefined) {
        await sql`UPDATE tasks SET description = ${updates.description} WHERE id = ${taskId}`;
      }
      if (updates.category_id !== undefined) {
        await sql`UPDATE tasks SET category_id = ${updates.category_id} WHERE id = ${taskId}`;
      }
      if (updates.due_date !== undefined) {
        await sql`UPDATE tasks SET due_date = ${updates.due_date} WHERE id = ${taskId}`;
      }
      if (updates.is_done !== undefined) {
        await sql`UPDATE tasks SET is_done = ${updates.is_done} WHERE id = ${taskId}`;
      }

      // Update local state
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ),
        isLoading: false,
        error: null
      }));
      
      get().applyFilters();
    } catch (error: any) {
      console.error('Error updating task:', error);
      set({ 
        error: error.message || 'Failed to update task', 
        isLoading: false 
      });
    }
  },

  updateExam: async (examId: number, updates: Partial<Exam>) => {
    set({ isLoading: true, error: null });
    try {
      if (updates.name !== undefined) {
        await sql`UPDATE exams SET name = ${updates.name} WHERE id = ${examId}`;
      }
      if (updates.subject !== undefined) {
        await sql`UPDATE exams SET subject = ${updates.subject} WHERE id = ${examId}`;
      }
      if (updates.description !== undefined) {
        await sql`UPDATE exams SET description = ${updates.description} WHERE id = ${examId}`;
      }
      if (updates.exam_date !== undefined) {
        await sql`UPDATE exams SET exam_date = ${updates.exam_date} WHERE id = ${examId}`;
      }

      set(state => ({
        exams: state.exams.map(exam => 
          exam.id === examId ? { ...exam, ...updates } : exam
        ),
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      console.error('Error updating exam:', error);
      set({ 
        error: error.message || 'Failed to update exam', 
        isLoading: false 
      });
    }
  },

  deleteTask: async (taskId: number) => {
    set({ isLoading: true, error: null });
    try {
      await sql`
        DELETE FROM tasks WHERE id = ${taskId}
      `;
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== taskId),
        isLoading: false,
        error: null
      }));
      
      get().applyFilters();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      set({ 
        error: error.message || 'Failed to delete task', 
        isLoading: false 
      });
    }
  },

  deleteExam: async (examId: number) => {
    set({ isLoading: true, error: null });
    try {
      await sql`
        DELETE FROM exams WHERE id = ${examId}
      `;
      
      set(state => ({
        exams: state.exams.filter(exam => exam.id !== examId),
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      console.error('Error deleting exam:', error);
      set({ 
        error: error.message || 'Failed to delete exam', 
        isLoading: false 
      });
    }
  },

  toggleTaskDone: async (taskId: number, isDone: boolean) => {
    try {
      await sql`
        UPDATE tasks SET is_done = ${isDone} WHERE id = ${taskId}
      `;
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, is_done: isDone } : task
        )
      }));
      
      get().applyFilters();
    } catch (error: any) {
      console.error('Error toggling task:', error);
      set({ error: error.message || 'Failed to toggle task' });
    }
  },

  setFilter: (key, value) => {
    set(state => ({
      filters: { ...state.filters, [key]: value }
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { tasks, filters, pageSize } = get();
    
    let filtered = [...tasks];
    
    if (filters.taskType !== 'all') {
      filtered = filtered.filter(task => task.task_type === filters.taskType);
    }
    
    if (filters.categoryId) {
      filtered = filtered.filter(task => task.category_id === filters.categoryId);
    }
    
    if (filters.isDone !== null) {
      filtered = filtered.filter(task => task.is_done === filters.isDone);
    }
    
    const page = 0;
    const end = (page + 1) * pageSize;
    const displayedTasks = filtered.slice(0, end);
    
    set({ 
      filteredTasks: filtered,
      displayedTasks,
      page: 0,
      hasMore: end < filtered.length
    });
  },

  loadMore: () => {
    const { page, pageSize, filteredTasks } = get();
    const nextPage = page + 1;
    const end = (nextPage + 1) * pageSize;
    
    const newDisplayedTasks = filteredTasks.slice(0, end);
    
    set({ 
      displayedTasks: newDisplayedTasks,
      page: nextPage,
      hasMore: end < filteredTasks.length
    });
  },

  resetFilters: () => {
    set({
      filters: {
        taskType: 'all',
        categoryId: null,
        isDone: null
      }
    });
    get().applyFilters();
  }
}));