import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../../store/notificationStore';
import { useTaskStore } from '../../store/taskStore';
import { useNavigate } from 'react-router-dom';

export const ExamNotifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { exams } = useTaskStore();
  const { 
    notifications,
    unviewedCount,
    updateNotifications, 
    markAsViewed, 
    markAllAsViewed 
  } = useNotificationStore();

  useEffect(() => {
    if (exams.length > 0) {
      updateNotifications(exams);
    }
  }, [exams]);

  const getSeverityStyles = (severity: string, status: string) => {
    if (status === 'past') {
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-500',
        icon: '⚪',
        badge: 'Passé',
        iconColor: 'text-gray-400'
      };
    }
    
    switch(severity) {
      case 'red': return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: '🔴',
        badge: status === 'today' ? "Aujourd'hui" : "Urgent",
        iconColor: 'text-red-500'
      };
      case 'orange': return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        icon: '🟠',
        badge: 'Cette semaine',
        iconColor: 'text-orange-500'
      };
      case 'green': return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: '🟢',
        badge: 'À venir',
        iconColor: 'text-green-500'
      };
      default: return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-800',
        icon: '⚪',
        badge: 'À venir',
        iconColor: 'text-gray-400'
      };
    }
  };

  const handleExamClick = (examId: number) => {
    markAsViewed(examId);
    navigate('/tasks');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bell Icon - Shows only total count, not unviewed separately */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Only show total count */}
        <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center px-1">
          {notifications.length}
        </span>

        {/* Removed the separate unviewed badge */}
      </button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Mes examens
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    {notifications.length} total
                  </span>
                  {unviewedCount > 0 && (
                    <span className="text-sm bg-red-500 px-2 py-1 rounded-full">
                      {unviewedCount} nouveau{unviewedCount > 1 ? 'x' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun examen planifié</p>
                  <p className="text-sm mt-1">Les examens apparaîtront ici</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const styles = getSeverityStyles(notification.severity, notification.status);
                  const isNew = !notification.viewed;
                  
                  return (
                    <motion.div
                      key={notification.examId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`${styles.bg} ${styles.border} border rounded-xl p-3 relative cursor-pointer hover:shadow-md transition-all ${
                        isNew ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                      }`}
                      onClick={() => handleExamClick(notification.examId)}
                    >
                      {/* New badge - only shows if not viewed */}
                      {isNew && (
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
                          Nouveau
                        </span>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${styles.iconColor}`}>
                          {styles.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-semibold ${styles.text} line-clamp-1`}>
                              {notification.examName}
                            </h4>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.bg} ${styles.text} border ${styles.border} whitespace-nowrap ml-2`}>
                              {styles.badge}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {notification.examSubject}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.examDate).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer - Only show "Mark all as viewed" if there are unviewed */}
            {unviewedCount > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={markAllAsViewed}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Tout marquer comme vu
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {/* Footer without mark all button */}
            {unviewedCount === 0 && notifications.length > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};