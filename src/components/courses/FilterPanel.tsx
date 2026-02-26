import React, { useState } from 'react';
import { useCourseStore } from '../../store/courseStore';
import { useAuth } from '../../context/AuthContext';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  totalResults: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, totalResults }) => {
  const { user } = useAuth();
  const { filters, setFilter, clearFilters } = useCourseStore();
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const contentTypes = [
    { value: 'video', label: 'Vidéos', icon: '🎥' },
    { value: 'text', label: 'Textes', icon: '📝' },
    { value: 'pdf', label: 'PDF', icon: '📄' },
    { value: 'image', label: 'Images', icon: '🖼️' }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter('search', searchInput);
  };

  const handleContentTypeToggle = (type: string) => {
    const current = filters.contentType || [];
    const newContentType = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    setFilter('contentType', newContentType);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    clearFilters();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4 sm:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtrer les cours
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({user?.niveau})
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {totalResults} résultat{totalResults !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Rechercher un cours..."
            className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setFilter('search', '');
              }}
              className="absolute right-3 top-3"
            >
              <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Content Type Filters */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Type de contenu</h4>
        <div className="flex flex-wrap gap-2">
          {contentTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleContentTypeToggle(type.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1
                ${filters.contentType?.includes(type.value)
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {(filters.search || filters.contentType?.length) && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Filtres actifs</h4>
            <button
              onClick={handleClearFilters}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Tout effacer
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                <span>🔍</span>
                <span className="max-w-[150px] truncate">{filters.search}</span>
                <button
                  onClick={() => {
                    setSearchInput('');
                    setFilter('search', '');
                  }}
                  className="ml-1 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.contentType?.map((type) => {
              const typeInfo = contentTypes.find(t => t.value === type);
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs"
                >
                  <span>{typeInfo?.icon}</span>
                  <span>{typeInfo?.label}</span>
                  <button
                    onClick={() => handleContentTypeToggle(type)}
                    className="ml-1 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};