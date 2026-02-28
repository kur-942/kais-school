import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ExamNotification {
  examId: number;
  examName: string;
  examDate: string;
  daysUntil: number;
  severity: 'green' | 'orange' | 'red';
  lastNotified: string;
  hidden: boolean;
}

interface NotificationState {
  notifications: ExamNotification[];
  lastChecked: string | null;
  
  checkExams: (exams: any[]) => void;
  hideNotification: (examId: number) => void;
  hideAllNotifications: () => void;
  clearOldNotifications: () => void;
  getActiveNotifications: () => ExamNotification[];
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      lastChecked: null,

      checkExams: (exams) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayStr = today.toISOString().split('T')[0];
        const lastChecked = get().lastChecked;
        
        // Only check once per day
        if (lastChecked === todayStr) {
          return;
        }

        const newNotifications: ExamNotification[] = [];
        
        exams.forEach((exam) => {
          const examDate = new Date(exam.exam_date);
          examDate.setHours(0, 0, 0, 0);
          
          const diffTime = examDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Only notify for upcoming exams within 3 days
          if (diffDays > 0 && diffDays <= 3) {
            // Check if notification already exists
            const existing = get().notifications.find(n => n.examId === exam.id);
            
            if (!existing || existing.hidden === false) {
              let severity: 'green' | 'orange' | 'red' = 'green';
              if (diffDays === 1) severity = 'red';
              else if (diffDays === 2) severity = 'orange';
              
              newNotifications.push({
                examId: exam.id,
                examName: exam.name,
                examDate: exam.exam_date,
                daysUntil: diffDays,
                severity,
                lastNotified: todayStr,
                hidden: false
              });
            }
          }
        });

        // Merge with existing non-hidden notifications
        const existingNotifications = get().notifications.filter(n => n.hidden === false);
        
        set({
          notifications: [...existingNotifications, ...newNotifications],
          lastChecked: todayStr
        });
      },

      hideNotification: (examId: number) => {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.examId === examId ? { ...n, hidden: true } : n
          )
        }));
      },

      hideAllNotifications: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, hidden: true }))
        }));
      },

      clearOldNotifications: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        set(state => ({
          notifications: state.notifications.filter(n => {
            const examDate = new Date(n.examDate);
            examDate.setHours(0, 0, 0, 0);
            return examDate >= today;
          })
        }));
      },

      getActiveNotifications: () => {
        return get().notifications.filter(n => !n.hidden);
      }
    }),
    {
      name: 'exam-notifications',
      storage: createJSONStorage(() => localStorage)
    }
  )
);