import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const ImageViewer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const imageUrl = params.get('url');
  const title = params.get('title') || 'Image';
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-red-600">
          <p className="text-base sm:text-lg mb-4">Aucune image spécifiée</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header - Version responsive */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Retour"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-md lg:max-w-xl">
                {title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer - Version responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-4 lg:p-6 border border-gray-200">
          {/* Controls - Adaptés pour mobile */}
          <div className="mb-4 sm:mb-6">
            {/* Version mobile : empilée */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Contrôles de zoom */}
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
                  className="p-2 sm:p-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Zoom arrière"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-sm sm:text-base w-14 sm:w-16 text-center font-medium">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale(prev => Math.min(2.0, prev + 0.1))}
                  className="p-2 sm:p-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Zoom avant"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <button
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-2 sm:p-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Rotation"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="hidden sm:inline">Télécharger</span>
                  <span className="sm:hidden">DL</span>
                </a>
              </div>
            </div>
          </div>

          {/* Image Display - Hauteur adaptative */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-2 sm:p-4"
               style={{ minHeight: '50vh', maxHeight: '80vh' }}>
            <img
              src={imageUrl}
              alt={title}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-out'
              }}
              className="max-w-full max-h-[40vh] sm:max-h-[60vh] lg:max-h-[70vh] w-auto h-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+non+disponible';
              }}
              loading="lazy"
            />
          </div>

          {/* Info supplémentaire (optionnel) */}
          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-xs sm:text-sm text-gray-400">
              💡 Utilisez les contrôles pour zoomer ou faire pivoter l'image
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};