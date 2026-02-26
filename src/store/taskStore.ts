import { create } from 'zustand';
import { neon } from '@neondatabase/serverless';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  task_type: 'todo' | 'exam';
  category_id: number | null;
  category_name?: string;
  exam_id: number | null;
  is_done: boolean;
  due_date: string | null;
  created_at: string;
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
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'category_name'>) => Promise<void>;
  addExam: (exam: Omit<Exam, 'id' | 'created_at'>) => Promise<void>;
  updateTask: (taskId: number, updates: Partial<Task>) => Promise<void>;
  updateExam: (examId: number, updates: Partial<Exam>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  deleteExam: (examId: number) => Promise<void>;
  toggleTaskDone: (taskId: number, isDone: boolean) => Promise<void>;
  setFilter: (key: keyof TaskState['filters'], value: any) => void;
  applyFilters: () => void;
  loadMore: () => void;
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
        category_name: task.category_name,
        exam_id: task.exam_id,
        is_done: task.is_done,
        due_date: task.due_date,
        created_at: task.created_at
      }));

      set({ 
        tasks: formattedTasks,
        isLoading: false 
      });
      
      get().applyFilters();
    } catch (error: any) {
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
      set({ 
        error: error.message || 'Failed to fetch exams', 
        isLoading: false 
      });
    }
  },

  addTask: async (task) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await sql`
        INSERT INTO tasks (
          user_id, title, description, task_type, 
          category_id, exam_id, is_done, due_date
        ) VALUES (
          ${task.user_id}, ${task.title}, ${task.description}, 
          ${task.task_type}, ${task.category_id}, ${task.exam_id}, 
          ${task.is_done}, ${task.due_date}
        )
        RETURNING *
      `;
      
      const typedNewTask = newTask as any[];
      
      if (typedNewTask && typedNewTask.length > 0) {
        const createdTask = typedNewTask[0];
        
        set(state => ({
          tasks: [...state.tasks, createdTask],
          isLoading: false
        }));
        
        get().applyFilters();
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to add task', 
        isLoading: false 
      });
    }
  },

  addExam: async (exam) => {
    set({ isLoading: true, error: null });
    try {
      const newExam = await sql`
        INSERT INTO exams (
          user_id, name, subject, exam_date, description
        ) VALUES (
          ${exam.user_id}, ${exam.name}, ${exam.subject}, 
          ${exam.exam_date}, ${exam.description}
        )
        RETURNING *
      `;
      
      const typedNewExam = newExam as any[];
      
      if (typedNewExam && typedNewExam.length > 0) {
        const createdExam = typedNewExam[0];
        
        set(state => ({
          exams: [...state.exams, createdExam],
          isLoading: false
        }));
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to add exam', 
        isLoading: false 
      });
    }
  },

  updateTask: async (taskId, updates) => {
    set({ isLoading: true, error: null });
    try {
      // Build dynamic update query
      const setClause = Object.keys(updates)
        .map((key, i) => `${key} = $${i + 2}`)
        .join(', ');
      
      
      await sql`
        UPDATE tasks 
        SET ${setClause}
        WHERE id = ${taskId}
      `;
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ),
        isLoading: false
      }));
      
      get().applyFilters();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update task', 
        isLoading: false 
      });
    }
  },

  updateExam: async (examId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const setClause = Object.keys(updates)
        .map((key, i) => `${key} = $${i + 2}`)
        .join(', ');
      
      
      await sql`
        UPDATE exams 
        SET ${setClause}
        WHERE id = ${examId}
      `;
      
      set(state => ({
        exams: state.exams.map(exam => 
          exam.id === examId ? { ...exam, ...updates } : exam
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update exam', 
        isLoading: false 
      });
    }
  },

  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      await sql`
        DELETE FROM tasks WHERE id = ${taskId}
      `;
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== taskId),
        isLoading: false
      }));
      
      get().applyFilters();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete task', 
        isLoading: false 
      });
    }
  },

  deleteExam: async (examId) => {
    set({ isLoading: true, error: null });
    try {
      await sql`
        DELETE FROM exams WHERE id = ${examId}
      `;
      
      set(state => ({
        exams: state.exams.filter(exam => exam.id !== examId),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete exam', 
        isLoading: false 
      });
    }
  },

  toggleTaskDone: async (taskId, isDone) => {
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
    
    // Filter by task type
    if (filters.taskType !== 'all') {
      filtered = filtered.filter(task => task.task_type === filters.taskType);
    }
    
    // Filter by category
    if (filters.categoryId) {
      filtered = filtered.filter(task => task.category_id === filters.categoryId);
    }
    
    // Filter by done status
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
  }
}));