import React, { useEffect, type JSX } from 'react';
import { useCategoryStore } from '../../store/categoryStore';
import { useCourseStore } from '../../store/courseStore';
import { useAuth } from '../../context/AuthContext';

interface CategoriesGridProps {
  onSelectCategory: () => void;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({ onSelectCategory }) => {
  const { user } = useAuth();
  const { categories, isLoading, error, fetchCategoriesByNiveau, selectCategory } = useCategoryStore();
  const { fetchCoursesByNiveau, filters, setFilter } = useCourseStore();

  useEffect(() => {
    if (user?.niveau) {
      fetchCategoriesByNiveau(user.niveau);
    }
  }, [user?.niveau]);

  const handleCategoryClick = (category: any) => {
    selectCategory(category);
    setFilter('categoryId', category.id);
    if (user?.niveau) {
      fetchCoursesByNiveau(user.niveau, category.id);
    }
    onSelectCategory();
  };

  const handleAllCoursesClick = () => {
    selectCategory(null);
    setFilter('categoryId', undefined);
    if (user?.niveau) {
      fetchCoursesByNiveau(user.niveau);
    }
    onSelectCategory();
  };

  const getCategoryIcon = (categoryName: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'Mathématiques': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      ),
      'Informatique': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      ),
      'Programmation': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      ),
      'Physique': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      ),
      'Chimie': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      ),
      'Biologie': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      ),
      'Technique': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      )
    };

    const iconPath = icons[categoryName] || (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    );

    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {iconPath}
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-green-100">
        <div className="inline-block p-4 bg-green-50 rounded-full mb-4">
          <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune catégorie disponible</h3>
        <p className="text-gray-500">Il n'y a pas encore de cours pour votre niveau.</p>
      </div>
    );
  }

  return (
    <div>
      {/* All Categories Option */}
      <div className="mb-4">
        <button
          onClick={handleAllCoursesClick}
          className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200
            ${!filters.categoryId 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${!filters.categoryId ? 'bg-green-500' : 'bg-gray-100'}`}>
              <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${!filters.categoryId ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-800">Tous les cours</h3>
              <p className="text-xs text-gray-500">
                {categories.reduce((acc, cat) => acc + (cat.course_count || 0), 0)} cours disponibles
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={`group p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105
              ${filters.categoryId === category.id
                ? 'border-green-500 bg-green-50 shadow-md' 
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
              }`}
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 rounded-full flex items-center justify-center
              ${filters.categoryId === category.id 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600'
              } transition-all duration-200`}
            >
              {getCategoryIcon(category.name)}
            </div>
            <h3 className="font-medium text-xs sm:text-sm text-center text-gray-800 line-clamp-1">
              {category.name}
            </h3>
            <p className="text-xs text-center text-gray-500 mt-1">
              {category.course_count} cours
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};