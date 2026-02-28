import React, { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../../store/courseStore';
import { useAuth } from '../../context/AuthContext';
import { useSavedStore } from '../../store/savedStore';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = memo(({ course }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isCourseSaved, saveCourse, unsaveCourse } = useSavedStore();
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (course?.id) {
      setIsSaved(isCourseSaved(course.id));
    }
  }, [course?.id, isCourseSaved]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.id) return;
    
    if (isSaved) {
      await unsaveCourse(user.id, course.id);
      setIsSaved(false);
    } else {
      await saveCourse(user.id, course.id);
      setIsSaved(true);
    }
  };

 // In CourseCard.tsx, update the handleOpenContent function
const handleOpenContent = useCallback((e: React.MouseEvent) => {
  e.preventDefault();
  
  switch (course.content_type) {
    case 'video':
      navigate(`/course/${course.id}`);
      break;
    case 'pdf':
      navigate(`/viewer/pdf?url=${encodeURIComponent(course.content_url)}&title=${encodeURIComponent(course.title)}`);
      break;
    case 'image':
      navigate(`/viewer/image?url=${encodeURIComponent(course.content_url)}&title=${encodeURIComponent(course.title)}`);
      break;
    case 'text':
      // For text, you might want to fetch and display the content
      window.open(course.content_url, '_blank');
      break;
    default:
      window.open(course.content_url, '_blank');
  }
}, [course, navigate]);

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = course.content_type === 'video' ? getYouTubeVideoId(course.content_url) : null;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  const getContentTypeIcon = () => {
    switch (course.content_type) {
      case 'video':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'text':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={handleOpenContent}
      className="block group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 relative">
        {/* Save Button */}
        <button
          onClick={handleSaveToggle}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${
            isSaved 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500 hover:bg-white'
          } ${isHovered || isSaved ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}
          title={isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg 
            className="w-5 h-5" 
            fill={isSaved ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        {/* Course Image/Thumbnail */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-100 to-green-50">
          {course.content_type === 'video' && thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />
          ) : course.content_type === 'image' ? (
            <img 
              src={course.content_url} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=Image+non+disponible';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl opacity-30">
                {course.content_type === 'pdf' ? '📄' : 
                 course.content_type === 'text' ? '📝' : 
                 '📁'}
              </div>
            </div>
          )}
          
          {/* Content Type Badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-green-700 shadow-sm flex items-center gap-1">
            {getContentTypeIcon()}
            <span className="capitalize">{course.content_type}</span>
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3 bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-lg">
            {course.category_name}
          </div>
        </div>

        {/* Course Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
            {course.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {course.description}
          </p>

          {/* Course Footer */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-500">
              {new Date(course.created_at).toLocaleDateString('fr-FR')}
            </span>
            
            <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600 group-hover:text-green-700 transition-colors">
              <span>
                {course.content_type === 'video' ? 'Regarder' :
                 course.content_type === 'pdf' ? 'Lire' :
                 course.content_type === 'text' ? 'Lire' :
                 course.content_type === 'image' ? 'Voir' : 'Ouvrir'}
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

CourseCard.displayName = 'CourseCard';