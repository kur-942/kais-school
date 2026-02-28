import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ExamNotification {
  examId: number;
  examName: string;
  examSubject: string;
  examDate: string;
  daysUntil: number;
  severity: 'green' | 'orange' | 'red' | 'gray';
  status: 'upcoming' | 'today' | 'past';
  viewed: boolean;
  viewedAt?: string; // Track when it was viewed
}

interface NotificationState {
  notifications: ExamNotification[];
  unviewedCount: number;
  
  updateNotifications: (exams: any[]) => void;
  markAsViewed: (examId: number) => void;
  markAllAsViewed: () => void;
  getNotifications: () => ExamNotification[];
  getUnviewedCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unviewedCount: 0,

      updateNotifications: (exams) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingNotifications = get().notifications;
        const updatedNotifications: ExamNotification[] = [];
        
        exams.forEach((exam) => {
          const examDate = new Date(exam.exam_date);
          examDate.setHours(0, 0, 0, 0);
          
          const diffTime = examDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Determine status and severity
          let status: 'upcoming' | 'today' | 'past' = 'upcoming';
          let severity: 'green' | 'orange' | 'red' | 'gray' = 'green';
          
          if (diffDays < 0) {
            status = 'past';
            severity = 'gray';
          } else if (diffDays === 0) {
            status = 'today';
            severity = 'red';
          } else if (diffDays === 1) {
            status = 'upcoming';
            severity = 'red';
          } else if (diffDays <= 3) {
            status = 'upcoming';
            severity = 'orange';
          } else {
            status = 'upcoming';
            severity = 'green';
          }
          
          // Find existing notification
          const existing = existingNotifications.find(n => n.examId === exam.id);
          
          if (existing) {
            // Preserve viewed status if exam date hasn't changed
            if (existing.examDate === exam.exam_date) {
              updatedNotifications.push({
                ...existing,
                daysUntil: diffDays,
                severity,
                status,
              });
            } else {
              // Date changed, reset viewed status
              updatedNotifications.push({
                examId: exam.id,
                examName: exam.name,
                examSubject: exam.subject,
                examDate: exam.exam_date,
                daysUntil: diffDays,
                severity,
                status,
                viewed: false,
              });
            }
          } else {
            // New exam
            updatedNotifications.push({
              examId: exam.id,
              examName: exam.name,
              examSubject: exam.subject,
              examDate: exam.exam_date,
              daysUntil: diffDays,
              severity,
              status,
              viewed: false,
            });
          }
        });
        
        // Sort by date (nearest first)
        const sorted = updatedNotifications.sort((a, b) => 
          new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
        );
        
        // Calculate unviewed count
        const unviewed = sorted.filter(n => !n.viewed).length;
        
        set({ 
          notifications: sorted,
          unviewedCount: unviewed 
        });
      },

      markAsViewed: (examId: number) => {
        set(state => {
          const updatedNotifications = state.notifications.map(n => 
            n.examId === examId ? { ...n, viewed: true, viewedAt: new Date().toISOString() } : n
          );
          
          const unviewed = updatedNotifications.filter(n => !n.viewed).length;
          
          return {
            notifications: updatedNotifications,
            unviewedCount: unviewed
          };
        });
      },

      markAllAsViewed: () => {
        set(state => {
          const updatedNotifications = state.notifications.map(n => ({ 
            ...n, 
            viewed: true,
            viewedAt: new Date().toISOString() 
          }));
          
          return {
            notifications: updatedNotifications,
            unviewedCount: 0
          };
        });
      },

      getNotifications: () => {
        return get().notifications;
      },

      getUnviewedCount: () => {
        return get().notifications.filter(n => !n.viewed).length;
      }
    }),
    {
      name: 'exam-notifications',
      storage: createJSONStorage(() => localStorage)
    }
  )
);