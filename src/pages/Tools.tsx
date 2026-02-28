import React, { useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
  shortcut: string;
}

export const Tools: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const tools: ToolCard[] = [
    {
      id: 'calculator',
      title: 'Calculatrice',
      description: 'Fonctions trigonométriques, puissances, racines',
      icon: (
        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'blue',
      shortcut: 'Ctrl + C'
    },
    {
      id: 'graph',
      title: 'Traceur',
      description: 'Visualisez vos fonctions en temps réel',
      icon: (
        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      color: 'green',
      shortcut: 'Ctrl + G'
    },
    {
      id: 'evaluator',
      title: 'Calculateur',
      description: 'Évaluez f(x) pour n\'importe quelle valeur',
      icon: (
        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple',
      shortcut: 'Ctrl + E'
    }
  ];

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          hover: 'hover:bg-blue-100',
          text: 'text-blue-600',
          border: 'border-blue-200',
          gradient: 'from-blue-500 to-blue-600'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          hover: 'hover:bg-green-100',
          text: 'text-green-600',
          border: 'border-green-200',
          gradient: 'from-green-500 to-green-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          hover: 'hover:bg-purple-100',
          text: 'text-purple-600',
          border: 'border-purple-200',
          gradient: 'from-purple-500 to-purple-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          hover: 'hover:bg-gray-100',
          text: 'text-gray-600',
          border: 'border-gray-200',
          gradient: 'from-gray-500 to-gray-600'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Retour"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                Outils Mathématiques
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tools Grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tools.map((tool, index) => {
            const colors = getColorClasses(tool.color);
            
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/tools/${tool.id}`)}
                className="cursor-pointer group"
              >
                <div className={`
                  ${colors.bg} ${colors.hover}
                  rounded-xl p-5 sm:p-6
                  border-2 ${colors.border}
                  transition-all duration-200
                  hover:scale-105 hover:shadow-lg
                `}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`
                      w-12 h-12 sm:w-14 sm:h-14
                      rounded-xl bg-white shadow-sm
                      flex items-center justify-center
                      ${colors.text}
                    `}>
                      {tool.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg sm:text-xl font-bold ${colors.text} mb-1`}>
                        {tool.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {tool.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                     
                        <span className={`text-xs font-medium ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                          Cliquez pour ouvrir →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Start Hint */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Cliquez sur un outil pour commencer
          </p>
        </div>
      </div>
    </div>
  );
};