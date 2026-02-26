import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCategoryStore } from '../../store/categoryStore';
import { useCourseStore } from '../../store/courseStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { categories, isLoading, fetchCategoriesByNiveau, selectCategory } = useCategoryStore();
  const { filters, setFilter, fetchCoursesByNiveau } = useCourseStore();
  
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(filters.contentType || []);

  useEffect(() => {
    if (user?.niveau) {
      fetchCategoriesByNiveau(user.niveau);
    }
  }, [user?.niveau]);

  const handleCategoryClick = (categoryId?: number) => {
    if (categoryId) {
      const category = categories.find(c => c.id === categoryId);
      selectCategory(category || null);
      setFilter('categoryId', categoryId);
    } else {
      selectCategory(null);
      setFilter('categoryId', undefined);
    }
    
    if (user?.niveau) {
      fetchCoursesByNiveau(user.niveau, categoryId);
    }
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter('search', searchInput);
  };

  const handleContentTypeToggle = (type: string) => {
    const newSelection = selectedContentTypes.includes(type)
      ? selectedContentTypes.filter(t => t !== type)
      : [...selectedContentTypes, type];
    
    setSelectedContentTypes(newSelection);
    setFilter('contentType', newSelection);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSelectedContentTypes([]);
    setFilter('search', '');
    setFilter('contentType', []);
  };

  const contentTypes = [
    { value: 'video', label: 'Vidéos', icon: '🎥', color: 'blue' },
    { value: 'text', label: 'Textes', icon: '📝', color: 'purple' },
    { value: 'pdf', label: 'PDF', icon: '📄', color: 'red' },
    { value: 'image', label: 'Images', icon: '🖼️', color: 'green' }
  ];

  const getCategoryIcon = (categoryName: string) => {
    const icons: { [key: string]: string } = {
      'Mathématiques': '📐',
      'Informatique': '💻',
      'Programmation': '👨‍💻',
      'Physique': '⚡',
      'Chimie': '🧪',
      'Biologie': '🧬',
      'Français': '📚',
      'Anglais': '🌍',
      'Histoire': '🏛️',
      'Géographie': '🗺️',
      'Philosophie': '🤔',
      'Économie': '📊',
      'Gestion': '📈',
      'Technique': '🔧'
    };
    return icons[categoryName] || '📘';
  };

  const activeFilterCount = [
    filters.search ? 1 : 0,
    filters.contentType?.length || 0
  ].reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none lg:z-0
        overflow-y-auto
      `}>
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-xl font-bold text-green-700">Filtres</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User niveau badge */}
          <div className="mb-6 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
            <p className="text-xs text-green-700 mb-1">Votre niveau</p>
            <p className="font-semibold text-green-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {user?.niveau}
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher
            </h3>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Titre, description..."
                  className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-sm"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          </div>

          {/* Content Type Filters */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Type de contenu
            </h3>
            <div className="space-y-2">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleContentTypeToggle(type.value)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all
                    ${selectedContentTypes.includes(type.value)
                      ? `border-${type.color}-500 bg-${type.color}-50`
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{type.label}</span>
                  </span>
                  {selectedContentTypes.includes(type.value) && (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Catégories
            </h3>

            {/* All courses option */}
            <button
              onClick={() => handleCategoryClick()}
              className={`
                w-full flex items-center justify-between p-3 mb-2 rounded-xl border-2 transition-all
                ${!filters.categoryId
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  !filters.categoryId ? 'bg-green-500' : 'bg-gray-100'
                }`}>
                  <svg className={`w-4 h-4 ${!filters.categoryId ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Tous les cours</span>
              </div>
              <span className="text-xs text-gray-500">
                {categories.reduce((acc, cat) => acc + (cat.course_count || 0), 0)}
              </span>
            </button>

            {/* Categories list */}
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all
                      ${filters.categoryId === category.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        filters.categoryId === category.id ? 'bg-green-500' : 'bg-gray-100'
                      }`}>
                        <span className="text-lg">{getCategoryIcon(category.name)}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{category.course_count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-green-800">Filtres actifs</h4>
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Tout effacer
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-green-700 rounded-lg text-xs border border-green-200">
                    <span>🔍</span>
                    <span className="max-w-[100px] truncate">{filters.search}</span>
                  </span>
                )}
                {filters.contentType?.map((type) => {
                  const typeInfo = contentTypes.find(t => t.value === type);
                  return (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white text-green-700 rounded-lg text-xs border border-green-200"
                    >
                      <span>{typeInfo?.icon}</span>
                      <span>{typeInfo?.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">
                  {categories.length}
                </p>
                <p className="text-xs text-gray-500">Catégories</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">
                  {categories.reduce((acc, cat) => acc + (cat.course_count || 0), 0)}
                </p>
                <p className="text-xs text-gray-500">Cours total</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};