import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTaskStore, type Task, type Exam, type NewTask, type NewExam } from '../store/taskStore';
import { useTaskCategoryStore } from '../store/taskCategoryStore';
import { useCategoryStore } from '../store/categoryStore';
import { useNavigate, Link } from 'react-router-dom';
import { TaskCategoryManager } from '../components/tasks/TaskCategoryManager';

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for category manager
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  
  const { categories, fetchCategoriesByNiveau } = useCategoryStore();
  const { categories: taskCategories, fetchCategories: fetchTaskCategories } = useTaskCategoryStore();
  
  const { 
    tasks,
    exams, 
    displayedTasks,
    filters,
    fetchTasks, 
    fetchExams,
    addTask,
    addExam,
    updateTask,
    updateExam,
    deleteTask,
    deleteExam,
    toggleTaskDone,
    setFilter,
    loadMore,
    hasMore,
    isLoading,
    error
  } = useTaskStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'todo' | 'exam'>('todo');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category_id: '',
    task_category_id: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const [examForm, setExamForm] = useState({
    name: '',
    subject: '',
    description: '',
    exam_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
      fetchExams(user.id);
      fetchTaskCategories(user.id);
      if (user?.niveau) {
        fetchCategoriesByNiveau(user.niveau);
      }
    }
  }, [user?.id]);

  const handleAddTask = async () => {
    if (!user?.id) return;

    const newTask: NewTask = {
      user_id: user.id,
      title: taskForm.title,
      description: taskForm.description || null,
      task_type: 'todo',
      category_id: taskForm.category_id ? parseInt(taskForm.category_id) : null,
      task_category_id: taskForm.task_category_id ? parseInt(taskForm.task_category_id) : null,
      exam_id: null,
      is_done: false,
      due_date: taskForm.due_date || null,
      priority: taskForm.priority
    };

    await addTask(newTask);

    setTaskForm({
      title: '',
      description: '',
      category_id: '',
      task_category_id: '',
      due_date: new Date().toISOString().split('T')[0],
      priority: 'medium'
    });
    setShowAddModal(false);
  };

  const handleAddExam = async () => {
    if (!user?.id) return;

    const newExam: NewExam = {
      user_id: user.id,
      name: examForm.name,
      subject: examForm.subject,
      description: examForm.description || null,
      exam_date: examForm.exam_date
    };

    await addExam(newExam);

    setExamForm({
      name: '',
      subject: '',
      description: '',
      exam_date: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(false);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    await updateTask(editingTask.id, {
      title: taskForm.title,
      description: taskForm.description || null,
      category_id: taskForm.category_id ? parseInt(taskForm.category_id) : null,
      task_category_id: taskForm.task_category_id ? parseInt(taskForm.task_category_id) : null,
      due_date: taskForm.due_date || null,
      priority: taskForm.priority
    });

    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      category_id: '',
      task_category_id: '',
      due_date: new Date().toISOString().split('T')[0],
      priority: 'medium'
    });
  };

  const handleUpdateExam = async () => {
    if (!editingExam) return;

    await updateExam(editingExam.id, {
      name: examForm.name,
      subject: examForm.subject,
      description: examForm.description || null,
      exam_date: examForm.exam_date
    });

    setEditingExam(null);
    setExamForm({
      name: '',
      subject: '',
      description: '',
      exam_date: new Date().toISOString().split('T')[0]
    });
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      category_id: task.category_id?.toString() || '',
      task_category_id: task.task_category_id?.toString() || '',
      due_date: task.due_date || new Date().toISOString().split('T')[0],
      priority: task.priority || 'medium'
    });
    setModalType('todo');
    setShowAddModal(true);
  };

  const openEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setExamForm({
      name: exam.name,
      subject: exam.subject,
      description: exam.description || '',
      exam_date: exam.exam_date
    });
    setModalType('exam');
    setShowAddModal(true);
  };

  const handleDeleteExam = async (examId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      await deleteExam(examId);
    }
  };

  const getTasksByDate = () => {
    const tasksByDate: { [key: string]: (Task | Exam)[] } = {};
    
    // Add tasks to date groups
    displayedTasks.forEach(task => {
      if (task.due_date) {
        if (!tasksByDate[task.due_date]) {
          tasksByDate[task.due_date] = [];
        }
        tasksByDate[task.due_date].push(task);
      }
    });
    
    // Add exams to date groups
    exams.forEach(exam => {
      if (!tasksByDate[exam.exam_date]) {
        tasksByDate[exam.exam_date] = [];
      }
      tasksByDate[exam.exam_date].push(exam);
    });
    
    // Sort dates
    return Object.keys(tasksByDate)
      .sort()
      .reduce((acc, date) => {
        acc[date] = tasksByDate[date];
        return acc;
      }, {} as { [key: string]: (Task | Exam)[] });
  };

  const getUpcomingExams = () => {
    const today = new Date().toISOString().split('T')[0];
    return exams
      .filter(exam => exam.exam_date >= today)
      .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
      .slice(0, 5);
  };

  const tasksByDate = getTasksByDate();
  const upcomingExams = getUpcomingExams();

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate stats for header
  const pendingTasks = tasks.filter(t => !t.is_done && t.task_type === 'todo').length;
  const pendingExams = exams.filter(e => new Date(e.exam_date) >= new Date()).length;
  const todoCount = tasks.filter(t => t.task_type === 'todo').length;

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Mes Tâches et Examens</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCategoryManager(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
                Catégories
              </button>
              <button
                onClick={() => {
                  setModalType('todo');
                  setEditingTask(null);
                  setEditingExam(null);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouveau
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 pb-3">
            <Link
              to="/tasks"
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {pendingExams}
              </div>
              <span className="text-sm font-medium text-orange-700">Examens à venir</span>
            </Link>

            <Link
              to="/tasks"
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {pendingTasks}
              </div>
              <span className="text-sm font-medium text-blue-700">Tâches à faire</span>
            </Link>

            <Link
              to="/tasks"
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {todoCount}
              </div>
              <span className="text-sm font-medium text-purple-700">Total tâches</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <TaskCategoryManager onClose={() => setShowCategoryManager(false)} />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-green-100">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filters.taskType}
              onChange={(e) => setFilter('taskType', e.target.value as any)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm"
            >
              <option value="all">Tous les types</option>
              <option value="todo">Tâches uniquement</option>
              <option value="exam">Examens uniquement</option>
            </select>

            <select
              value={filters.taskCategoryId || ''}
              onChange={(e) => setFilter('taskCategoryId', e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm"
            >
              <option value="">Toutes catégories perso</option>
              {taskCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>

            <select
              value={filters.categoryId || ''}
              onChange={(e) => setFilter('categoryId', e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm"
            >
              <option value="">Toutes catégories cours</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilter('priority', e.target.value as any)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm"
            >
              <option value="all">Toutes priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>

            <select
              value={filters.isDone === null ? '' : filters.isDone ? 'done' : 'pending'}
              onChange={(e) => {
                const value = e.target.value;
                setFilter('isDone', value === '' ? null : value === 'done');
              }}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm"
            >
              <option value="">Tous statuts</option>
              <option value="pending">À faire</option>
              <option value="done">Terminé</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Upcoming Exams Section */}
        {upcomingExams.length > 0 && filters.taskType !== 'todo' && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-green-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Examens à venir
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingExams.map(exam => (
                <div key={exam.id} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{exam.name}</h3>
                      <p className="text-sm text-gray-600">{exam.subject}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditExam(exam)}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      {new Date(exam.exam_date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {exam.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{exam.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks and Exams by Date */}
        <div className="space-y-6">
          {Object.entries(tasksByDate).map(([date, items]) => (
            <div key={date} className="bg-white rounded-xl shadow-md overflow-hidden border border-green-100">
              <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-3 border-b border-green-200">
                <h3 className="font-semibold text-green-800">
                  {new Date(date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map(item => {
                  // Check if it's an exam (has 'subject' property)
                  if ('subject' in item) {
                    const exam = item as Exam;
                    return (
                      <div key={`exam-${exam.id}`} className="p-4 hover:bg-orange-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 w-5 h-5 text-orange-500">📝</div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-800">{exam.name}</h4>
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                    Examen
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Matière: {exam.subject}</p>
                                {exam.description && (
                                  <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => openEditExam(exam)}
                                  className="text-gray-400 hover:text-blue-600"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteExam(exam.id)}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // It's a task
                    const task = item as Task;
                    return (
                      <div key={`task-${task.id}`} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={task.is_done}
                            onChange={(e) => toggleTaskDone(task.id, e.target.checked)}
                            className="mt-1 w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`font-medium ${task.is_done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                    {task.title}
                                  </h4>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                                    {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                  </span>
                                </div>
                                {task.description && (
                                  <p className={`text-sm mt-1 ${task.is_done ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {task.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                {task.task_category && (
                                  <span 
                                    className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                                    style={{ 
                                      backgroundColor: task.task_category.color + '20',
                                      color: task.task_category.color 
                                    }}
                                  >
                                    <span>{task.task_category.icon}</span>
                                    <span>{task.task_category.name}</span>
                                  </span>
                                )}
                                {task.category_name && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    {task.category_name}
                                  </span>
                                )}
                                <button
                                  onClick={() => openEditTask(task)}
                                  className="text-gray-400 hover:text-blue-600"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && displayedTasks.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Charger plus
            </button>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && exams.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-green-50 rounded-full mb-4">
              <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune tâche ni examen</h3>
            <p className="text-gray-500 mb-4">Commencez par créer une nouvelle tâche ou un examen.</p>
            <button
              onClick={() => {
                setModalType('todo');
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
            >
              Créer maintenant
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingTask || editingExam ? 'Modifier' : 'Nouveau'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTask(null);
                  setEditingExam(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Type Selector */}
            {!editingTask && !editingExam && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setModalType('todo')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    modalType === 'todo' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tâche
                </button>
                <button
                  onClick={() => setModalType('exam')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    modalType === 'exam' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Examen
                </button>
              </div>
            )}

            {modalType === 'todo' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                editingTask ? handleUpdateTask() : handleAddTask();
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="Ma tâche"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="Description de la tâche..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as any})}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      >
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                      <input
                        type="date"
                        value={taskForm.due_date}
                        onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie personnelle</label>
                    <select
                      value={taskForm.task_category_id}
                      onChange={(e) => setTaskForm({...taskForm, task_category_id: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    >
                      <option value="">Sans catégorie</option>
                      {taskCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie de cours</label>
                    <select
                      value={taskForm.category_id}
                      onChange={(e) => setTaskForm({...taskForm, category_id: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    >
                      <option value="">Sans catégorie</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingTask(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
                  >
                    {editingTask ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </form>
            )}

            {modalType === 'exam' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                editingExam ? handleUpdateExam() : handleAddExam();
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'examen</label>
                    <input
                      type="text"
                      value={examForm.name}
                      onChange={(e) => setExamForm({...examForm, name: e.target.value})}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="Examen de mathématiques"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                    <input
                      type="text"
                      value={examForm.subject}
                      onChange={(e) => setExamForm({...examForm, subject: e.target.value})}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="Mathématiques"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={examForm.description}
                      onChange={(e) => setExamForm({...examForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="Description de l'examen..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de l'examen</label>
                    <input
                      type="date"
                      value={examForm.exam_date}
                      onChange={(e) => setExamForm({...examForm, exam_date: e.target.value})}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingExam(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                  >
                    {editingExam ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};