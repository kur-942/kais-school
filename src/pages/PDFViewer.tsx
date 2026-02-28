import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const PDFViewer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pdfUrl = params.get('url') || '';
  const title = params.get('title') || 'Document PDF';
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Simuler un chargement (optionnel)
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Entrer en plein écran
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      // Sortir du plein écran
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Détecter les changements de plein écran (touche Echap)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600 p-4">
          <p className="text-lg mb-4">Aucun PDF spécifié</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 ${isFullscreen ? 'overflow-hidden' : ''}`}>
      {/* Header - Conditionnel en mode plein écran */}
      {!isFullscreen && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-0 sm:h-16 gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Retour"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-md">
                  {title}
                </h1>
              </div>
              
              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <button
                  onClick={toggleFullscreen}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm sm:text-base"
                  title="Plein écran"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <span className="hidden sm:inline">Plein écran</span>
                </button>
                <a
                  href={pdfUrl.replace('/preview', '/view')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="hidden sm:inline">Ouvrir</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualiseur Principal */}
      <div 
        ref={containerRef}
        className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'max-w-7xl mx-auto px-4 py-8'}`}
      >
        <div className={`${isFullscreen ? 'h-full w-full' : 'bg-white rounded-2xl shadow-xl p-3 sm:p-6 border border-gray-200'}`}>
          
          {/* Barre de contrôle en mode plein écran */}
          {isFullscreen && (
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all"
                title="Quitter le plein écran"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364m12.728 0L5.636 5.636" />
                </svg>
              </button>
              <a
                href={pdfUrl.replace('/preview', '/view')}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all"
                title="Ouvrir dans Google Drive"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          {/* Conteneur de l'iframe avec ratio adaptatif */}
          <div className={`
            relative w-full 
            ${isFullscreen ? 'h-full' : 'aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/9]'}
          `}>
            {/* Loader */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement du PDF...</p>
                </div>
              </div>
            )}

            {/* Iframe */}
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              className={`w-full h-full rounded-lg border-0 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              title={title}
              allow="autoplay"
              onLoad={() => setIsLoading(false)}
            />
          </div>

          {/* Note d'information (cachée en plein écran) */}
          {!isFullscreen && (
            <div className="mt-4 text-xs sm:text-sm text-gray-400 text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Utilisez les contrôles Google Drive
              </span>
              <span className="hidden sm:block">•</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Plein écran pour une meilleure lisibilité
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};