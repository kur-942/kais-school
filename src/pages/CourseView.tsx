import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { neon } from '@neondatabase/serverless';
import type { Course } from '../store/courseStore';

export const CourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  const DATABASE_URL = import.meta.env.VITE_URL;
  const sql = neon(DATABASE_URL);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      setIsLoading(true);
      try {
        const result = await sql`
          SELECT 
            c.*,
            cat.name as category_name
          FROM courses c
          JOIN categories cat ON c.category_id = cat.id
          WHERE c.id = ${parseInt(courseId)}
        `;
        
        const typedResult = result as any[];
        
        if (typedResult && typedResult.length > 0) {
          const courseData = typedResult[0];
          setCourse({
            id: courseData.id,
            title: courseData.title,
            description: courseData.description,
            niveau: courseData.niveau,
            category_id: courseData.category_id,
            category_name: courseData.category_name,
            content_type: courseData.content_type,
            content_url: courseData.content_url,
            created_at: courseData.created_at
          });
        } else {
          setError('Cours non trouvé');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du cours');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    // Adjust content height to fit viewport
    const updateContentHeight = () => {
      if (contentRef.current) {
        const headerHeight = 64; // Height of the simple header
        const windowHeight = window.innerHeight;
        const availableHeight = windowHeight - headerHeight - 48; // 48px for padding
        setContentHeight(availableHeight);
      }
    };

    updateContentHeight();
    window.addEventListener('resize', updateContentHeight);
    
    return () => {
      window.removeEventListener('resize', updateContentHeight);
    };
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
    // Here you would implement the actual save logic
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : null;
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4 animate-pulse">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Chargement du cours...</h2>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-100">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oups !</h2>
          <p className="text-gray-600 mb-6">{error || 'Cours non trouvé'}</p>
          <button
            onClick={handleGoBack}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const embedUrl = course.content_type === 'video' ? getYouTubeEmbedUrl(course.content_url) : null;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Simple Header - Fixed height */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left side - Navigation */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={handleGoBack}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Retour"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              
              <Link
                to="/"
                className="text-base sm:text-lg font-semibold text-green-700 hover:text-green-800 transition-colors truncate"
              >
                EduPlatform
              </Link>

              {/* Course title - hidden on mobile, visible on desktop */}
              <span className="hidden sm:block text-sm text-gray-500 truncate max-w-xs ml-2">
                {course.title}
              </span>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Save button */}
              <button
                onClick={toggleSave}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  isSaved 
                    ? 'text-yellow-500 hover:text-yellow-600' 
                    : 'text-gray-500 hover:text-yellow-500'
                }`}
                aria-label={isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              {/* External link button */}
              <a
                href={course.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Ouvrir dans un nouvel onglet"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Takes remaining height */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto"
        style={{ height: contentHeight ? `${contentHeight}px` : 'auto' }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Course Title - Mobile only */}
          <h1 className="sm:hidden text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
            {course.title}
          </h1>
          
          {/* Course Meta - Mobile optimized */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {course.category_name}
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {course.niveau}
            </span>
            <span className="text-xs text-gray-500 ml-auto">
              {new Date(course.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>

          {/* Content Area - Fits in viewport */}
          <div className="bg-white  sm:mx-w-[80%] sm:w-[60%] m-auto sm:h-[65vh] rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            
            {/* Video Content - Perfect aspect ratio */}
            {course.content_type === 'video' && embedUrl && (
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={embedUrl}
                  title={course.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* PDF Content - Full height scrollable */}
            {course.content_type === 'pdf' && (
              <div className="w-full" style={{ height: 'calc(100vh - 180px)' }}>
                <iframe
                  src={`${course.content_url}#toolbar=0&navpanes=0&scrollbar=1`}
                  title={course.title}
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Text Content - Scrollable with font controls */}
            {course.content_type === 'text' && (
              <div className="p-4 sm:p-6">
                {/* Font size controls */}
                <div className="flex items-center justify-end gap-2 mb-4 sticky top-0 bg-white/90 backdrop-blur-sm py-2 z-10 border-b border-gray-100">
                  <span className="text-xs sm:text-sm text-gray-500">Taille:</span>
                  <button
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-sm sm:text-base"
                    disabled={fontSize <= 12}
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs sm:text-sm">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-sm sm:text-base"
                    disabled={fontSize >= 24}
                  >
                    +
                  </button>
                </div>

                {/* Text content */}
                <div 
                  className="prose max-w-none overflow-y-auto"
                  style={{ 
                    fontSize: `${fontSize}px`,
                    maxHeight: 'calc(100vh - 280px)'
                  }}
                >
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {course.description}
                  </p>
                  <p className="text-gray-500 mt-4 text-sm border-t pt-4">
                    Pour accéder au contenu complet, utilisez le bouton d'ouverture externe.
                  </p>
                </div>
              </div>
            )}

            {/* Image Content - Centered with max dimensions */}
            {course.content_type === 'image' && (
              <div className="p-4 sm:p-6 flex items-center justify-center bg-gray-50">
                <img
                  src={course.content_url}
                  alt={course.title}
                  className="max-w-full max-h-[calc(100vh-250px)] w-auto h-auto object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+non+disponible';
                  }}
                />
              </div>
            )}
          </div>

          {/* Course Description - Collapsible or hidden on mobile to save space */}
          <details className="mt-4 sm:mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">
              <span>Description du cours</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {course.description}
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};