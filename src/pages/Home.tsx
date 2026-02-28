import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourseStore } from '../store/courseStore';
import { CourseGrid } from '../components/courses/CourseGrid';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { 
    displayedCourses, 
    filteredCourses,
    isLoading, 
    error, 
    hasMore, 
    fetchCoursesByNiveau, 
    loadMore,
    filters
  } = useCourseStore();

  // Memoize handlers to prevent recreation on each render
  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (user?.niveau && !filters.categoryId) {
      fetchCoursesByNiveau(user.niveau);
    }
  }, [user?.niveau, filters.categoryId, fetchCoursesByNiveau]);
  
  useEffect(() => {
    // Use a ref to track if component is mounted
    const abortController = new AbortController();
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    return () => {
      abortController.abort();
    };
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <Header onMenuClick={toggleSidebar} sidebarOpen={isSidebarOpen} />

      <div className="flex relative">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <StatCard 
                label="Affichés" 
                value={displayedCourses.length} 
                icon="book" 
                color="green"
              />
              <StatCard 
                label="Vidéos" 
                value={displayedCourses.filter(c => c.content_type === 'video').length} 
                icon="video" 
                color="blue"
              />
              <StatCard 
                label="Documents" 
                value={displayedCourses.filter(c => c.content_type !== 'video').length} 
                icon="document" 
                color="purple"
              />
              <StatCard 
                label="Total" 
                value={filteredCourses.length} 
                icon="total" 
                color="amber"
              />
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                {filters.categoryId ? 'Cours filtrés' : 'Tous les cours'}
              </h2>
              <button
                onClick={toggleSidebar}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filtres
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <CourseGrid courses={displayedCourses} isLoading={isLoading} />

            {/* Load More Button */}
            {hasMore && !isLoading && displayedCourses.length > 0 && (
              <div className="mt-8 sm:mt-10 text-center">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm sm:text-base font-medium rounded-xl transition-all duration-200 shadow-lg shadow-green-200 transform hover:scale-105 active:scale-95"
                >
                  <span>Voir plus de cours</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}

            {/* No more courses message */}
            {!hasMore && displayedCourses.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-500 text-xs sm:text-sm">
                  Vous avez vu tous les cours disponibles
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Extracted StatCard component for better reusability
const StatCard = React.memo(({ label, value, icon, color }: { 
  label: string; 
  value: number; 
  icon: string;
  color: string;
}) => {
  const getIcon = () => {
    switch(icon) {
      case 'book':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        );
      case 'video':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        );
      case 'document':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        );
      case 'total':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        );
      default:
        return null;
    }
  };

  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600'
  };

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-green-100">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {getIcon()}
          </svg>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-500">{label}</p>
          <p className="text-base sm:text-lg font-semibold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';